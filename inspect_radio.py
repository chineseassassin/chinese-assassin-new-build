from PIL import Image

img = Image.open('CODE-RADIO-1.png').convert('RGB')
w, h = img.size
print(f"Size: {w}x{h}")

# Save crops for visual debugging
box_crop = img.crop((int(w * 0.25), int(h * 0.45), int(w * 0.75), int(h * 0.75)))
box_crop.save('debug_radio_box.png')

button_crop = img.crop((int(w * 0.25), int(h * 0.70), int(w * 0.75), int(h * 0.95)))
button_crop.save('debug_radio_button.png')

# Find red plaque button bounding box (red text / button)
# Check red intensity
red_pixels = []
for y in range(int(h * 0.65), int(h * 0.95)):
    for x in range(int(w * 0.2), int(w * 0.8)):
        r, g, b = img.getpixel((x, y))
        if r > 150 and g < 60 and b < 60:
            red_pixels.append((x, y))

if red_pixels:
    min_x = min(p[0] for p in red_pixels)
    max_x = max(p[0] for p in red_pixels)
    min_y = min(p[1] for p in red_pixels)
    max_y = max(p[1] for p in red_pixels)
    print(f"Red button area:")
    print(f"X: {min_x/w*100:.2f}% to {max_x/w*100:.2f}% (Center X: {(min_x+max_x)/(2*w)*100:.2f}%, Width: {(max_x-min_x)/w*100:.2f}%)")
    print(f"Y: {min_y/h*100:.2f}% to {max_y/h*100:.2f}% (Center Y: {(min_y+max_y)/(2*h)*100:.2f}%, Height: {(max_y-min_y)/h*100:.2f}%)")
