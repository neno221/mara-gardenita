<#
.SYNOPSIS
    Dumps the Payload database, and the media directory alongside it.

.DESCRIPTION
    Decision C in docs/payload-plan.md puts the database in a single local Docker
    volume and the uploads in a gitignored public/media. Neither is covered by
    version control, so this is the only backup either one gets.

    Run it before every `payload migrate`, and before anything that touches the
    volume. The media copy is not optional: restoring a dump without the matching
    uploads leaves every Media document pointing at a file that is not there.

.PARAMETER OutDir
    Where to write the dump. Defaults to backups/ at the repo root.

.PARAMETER SkipMedia
    Dump the database only. Use when public/media has not changed since the last run.

.EXAMPLE
    ./scripts/db-dump.ps1
    ./scripts/db-dump.ps1 -OutDir D:\backups
#>
[CmdletBinding()]
param(
    [string] $OutDir,
    [switch] $SkipMedia
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
if (-not $OutDir) { $OutDir = Join-Path $repoRoot 'backups' }
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$container = 'mara-gardenita-db'
$dbUser    = 'loovio'
$dbName    = 'loovio'
$stamp     = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$dumpPath  = Join-Path $OutDir "$dbName-$stamp.sql"

# Fail loudly if the container is not up, rather than writing an empty file.
$running = docker ps --filter "name=$container" --filter 'status=running' --format '{{.Names}}'
if ($running -ne $container) {
    throw "Container '$container' is not running. Start it with: docker compose up -d"
}

Write-Host "Dumping $dbName -> $dumpPath"
# stdout is redirected rather than using -f, so the file lands on the host.
# --clean --if-exists makes the dump restorable over an existing database.
docker exec $container pg_dump -U $dbUser -d $dbName --clean --if-exists |
    Out-File -FilePath $dumpPath -Encoding utf8
if ($LASTEXITCODE -ne 0) { throw "pg_dump failed with exit code $LASTEXITCODE" }

$dumpSize = (Get-Item $dumpPath).Length
if ($dumpSize -eq 0) { throw "pg_dump produced an empty file: $dumpPath" }
Write-Host ("  {0:N0} bytes" -f $dumpSize)

if (-not $SkipMedia) {
    $mediaDir = Join-Path $repoRoot 'public/media'
    if (Test-Path $mediaDir) {
        $mediaPath = Join-Path $OutDir "media-$stamp.zip"
        Write-Host "Archiving public/media -> $mediaPath"
        Compress-Archive -Path (Join-Path $mediaDir '*') -DestinationPath $mediaPath -Force
        Write-Host ("  {0:N0} bytes" -f (Get-Item $mediaPath).Length)
    } else {
        Write-Host 'public/media does not exist yet; skipping the media archive.'
    }
}

Write-Host ''
Write-Host 'Restore with:'
Write-Host "  Get-Content '$dumpPath' | docker exec -i $container psql -U $dbUser -d $dbName"
Write-Host '  Expand-Archive <media zip> -DestinationPath public/media -Force'
