from PIL import Image

img = Image.open('CODE-CHEF-1.png').convert('RGB')
w, h = img.size

# Let's find rows and columns of the rectangular plaque border
# Let's check Y from 73% to 86%
for y_pct in range(74, 86):
    y = int(h * y_pct / 100)
    red_xs = []
    for x in range(int(w * 0.3), int(w * 0.7)):
        r, g, b = img.getpixel((x, y))
        if r > 80 and g < 30 and b < 30: # red button fill
            red_xs.append(x)
    if red_xs:
        print(f"Plaque at Y={y_pct}% (px {y}): X from {min(red_xs)/w*100:.2f}% to {max(red_xs)/w*100:.2f}%")
