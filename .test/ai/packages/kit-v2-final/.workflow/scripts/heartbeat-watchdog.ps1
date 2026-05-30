param(
  [Parameter(Mandatory=$true)][int]$Pid,
  [Parameter(Mandatory=$true)][string]$TaskType,
  [int]$Interval = 30,
  [int]$Timeout = 120,
  [int]$Retries = 3
)

# Heartbeat watchdog for Windows
# Monitors a process by PID, checks stdout output, and handles timeout/retry

$retryCount = 0
$lastOutputTime = Get-Date
$stdoutFile = $null

function Test-ProcessAlive {
  param([int]$TargetPid)
  try {
    $proc = Get-Process -Id $TargetPid -ErrorAction SilentlyContinue
    return $proc -ne $null -and -not $proc.HasExited
  } catch {
    return $false
  }
}

function Stop-ProcessGracefully {
  param([int]$TargetPid)
  try {
    Stop-Process -Id $TargetPid -Force:$false -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 5
    if (Test-ProcessAlive -TargetPid $TargetPid) {
      Stop-Process -Id $TargetPid -Force -ErrorAction SilentlyContinue
    }
  } catch {
    # Process may already be gone
  }
}

Write-Host "[heartbeat-watchdog] Starting monitoring for PID $Pid (task-type: $TaskType, interval: ${Interval}s, timeout: ${Timeout}s, retries: $Retries)"

while ($retryCount -lt $Retries) {
  Start-Sleep -Seconds $Interval

  # Check if process is still alive
  if (-not (Test-ProcessAlive -TargetPid $Pid)) {
    Write-Host "[heartbeat-watchdog] PID $Pid is no longer alive."
    $retryCount += 1
    if ($retryCount -ge $Retries) {
      Write-Error "[heartbeat-watchdog] Process lost after $Retries retries. Task marked as failed."
      exit 1
    }
    Write-Host "[heartbeat-watchdog] Retry $retryCount / $Retries — process lost, restarting not supported in watchdog mode."
    continue
  }

  # Check stdout output if a stdout file is available
  $possibleStdoutFiles = @(
    ".plan/runs/latest.stdout",
    ".plan/runs/latest.log",
    "output.log",
    "stdout.log"
  )
  foreach ($candidate in $possibleStdoutFiles) {
    if (Test-Path $candidate) {
      $stdoutFile = $candidate
      break
    }
  }

  $hasOutput = $false
  if ($stdoutFile -and (Test-Path $stdoutFile)) {
    $lastWrite = (Get-Item $stdoutFile).LastWriteTime
    if ($lastWrite -gt $lastOutputTime) {
      $lastOutputTime = $lastWrite
      $hasOutput = $true
    }
  }

  $elapsed = ([DateTime]::Now - $lastOutputTime).TotalSeconds
  if (-not $hasOutput -and $elapsed -gt $Timeout) {
    Write-Host "[heartbeat-watchdog] Timeout detected for PID $Pid (no output for ${elapsed}s)."
    Stop-ProcessGracefully -TargetPid $Pid
    $retryCount += 1
    if ($retryCount -ge $Retries) {
      Write-Error "[heartbeat-watchdog] Task failed after $Retries retries."
      exit 1
    }
    Write-Host "[heartbeat-watchdog] Retry $retryCount / $Retries — SIGTERM sent, waiting for restart..."
  }
}

Write-Host "[heartbeat-watchdog] Monitoring ended."