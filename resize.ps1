
$sourcePath = "C:\Users\bonek\Documents\Y_schedule\Y_schedule\public\og-image.png"
$destPath = "C:\Users\bonek\Documents\Y_schedule\Y_schedule\public\og-image-resized.png"

try {
    Add-Type -AssemblyName System.Drawing
    $img = [System.Drawing.Image]::FromFile($sourcePath)
    $bmp = New-Object System.Drawing.Bitmap(1200, 630)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $g.DrawImage($img, 0, 0, 1200, 630)
    
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $img.Dispose()
    $bmp.Dispose()
    $g.Dispose()
    
    if (Test-Path $destPath) {
        Move-Item -Path $destPath -Destination $sourcePath -Force
        Write-Output "Successfully resized image"
    } else {
        Write-Output "Failed to save resized image"
    }
} catch {
    Write-Error $_.Exception.Message
}
