import os
import cv2
import numpy as np
from PIL import Image

src_path = r'C:\Users\ALI REHAN ARSHAD\.gemini\antigravity-ide\brain\7c8bdcf5-3558-4ff1-bd7c-f54eb84537fd\.user_uploaded\media_1789237794576.png'
out_dir = r'd:\market pulse\client\public'
os.makedirs(out_dir, exist_ok=True)

img_bgr = cv2.imread(src_path)
h, w = img_bgr.shape[:2]

# Compute Euclidean difference from pure white (255, 255, 255)
diff_from_white = np.linalg.norm(255.0 - img_bgr.astype(np.float32), axis=2)

# Background seed mask: pixels that are very close to white (dist < 14.0)
bg_mask = (diff_from_white < 14.0).astype(np.uint8)

# Floodfill from 4 corners to isolate external background
cv2.floodFill(bg_mask, None, (0, 0), 2)
cv2.floodFill(bg_mask, None, (w - 1, 0), 2)
cv2.floodFill(bg_mask, None, (0, h - 1), 2)
cv2.floodFill(bg_mask, None, (w - 1, h - 1), 2)

is_bg = (bg_mask == 2)
fg_mask = (~is_bg).astype(np.uint8)

# Compute distances
dist_inside = cv2.distanceTransform(fg_mask, cv2.DIST_L2, 5)
dist_outside = cv2.distanceTransform(is_bg.astype(np.uint8), cv2.DIST_L2, 5)

# Smooth transition within +/- 1.5 pixels of boundary
alpha = np.zeros((h, w), dtype=np.float32)
# Inside logo
alpha[dist_inside >= 1.5] = 255.0
# Boundary zone
transition_zone = (dist_inside < 1.5) & (dist_outside < 1.5)
# In transition zone, blend from 0 to 255
alpha[transition_zone] = ((dist_inside[transition_zone] - (-dist_outside[transition_zone])) / 3.0) * 255.0
alpha[dist_inside >= 1.5] = 255.0
alpha[dist_outside >= 1.5] = 0.0

final_alpha = np.clip(alpha, 0, 255).astype(np.uint8)

# Color defringing: where alpha < 255 and alpha > 0, we can slightly defringe white contamination
rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB).astype(np.float32)
a_norm = (final_alpha.astype(np.float32) / 255.0)[:, :, None]
# Wherever alpha > 0, remove white background blending: (C - (1-a)*255) / a
safe_a = np.maximum(a_norm, 0.01)
unpremultiplied_rgb = np.clip((rgb - (1.0 - a_norm) * 255.0) / safe_a, 0, 255)
# Only apply defringing near the boundary
use_defringed = np.where((final_alpha > 0) & (final_alpha < 250))
rgb_clean = rgb.copy()
rgb_clean[use_defringed] = unpremultiplied_rgb[use_defringed]
rgb_clean = np.clip(rgb_clean, 0, 255).astype(np.uint8)

rgba = np.dstack((rgb_clean, final_alpha))
full_logo = Image.fromarray(rgba)
full_logo.save(os.path.join(out_dir, 'marky-logo.png'), 'PNG')

bbox = full_logo.getbbox()
if bbox:
    cropped = full_logo.crop(bbox)
    max_dim = max(cropped.width, cropped.height)
    pad = int(max_dim * 0.12)
    target_size = max_dim + pad * 2
    avatar_canvas = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))
    offset_x = (target_size - cropped.width) // 2
    offset_y = (target_size - cropped.height) // 2
    avatar_canvas.paste(cropped, (offset_x, offset_y), cropped)
    
    avatar_canvas.save(os.path.join(out_dir, 'marky-avatar.png'), 'PNG')
    
    icon_canvas = avatar_canvas.resize((128, 128), Image.Resampling.LANCZOS)
    icon_canvas.save(os.path.join(out_dir, 'marky-icon.png'), 'PNG')
    
    fav_canvas = avatar_canvas.resize((48, 48), Image.Resampling.LANCZOS)
    fav_canvas.save(os.path.join(out_dir, 'favicon.ico'), format='ICO')
    print("Regenerated flawless defringed Marky logo assets.")
