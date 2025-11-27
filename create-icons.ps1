# PowerShell script to create simple extension icons
$sizes = @(16, 48, 128)
$color = "#4285F4"  # Google Blue

foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Fill with blue color
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(66, 133, 244))
    $graphics.FillRectangle($brush, 0, 0, $size, $size)
    
    # Draw simple book icon (white rectangle with lines)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $margin = [int]($size * 0.25)
    $graphics.FillRectangle($whiteBrush, $margin, $margin, $size - 2*$margin, $size - 2*$margin)
    
    # Draw lines
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(66, 133, 244), [Math]::Max(1, $size / 32))
    for ($i = 1; $i -lt 4; $i++) {
        $y = $margin + ($size - 2*$margin) * $i / 4
        $graphics.DrawLine($pen, $margin + $size/8, $y, $size - $margin - $size/8, $y)
    }
    
    $filePath = "extension\icons\icon$size.png"
    $bitmap.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    Write-Host "Created: $filePath"
    
    $graphics.Dispose()
    $bitmap.Dispose()
}

Write-Host "`nAll icons created successfully!"

