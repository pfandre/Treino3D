import re

with open('js/imageAnatomyInteractive.js', 'r') as f:
    content = f.read()

# Define the new trapezio lines for each frame
new_traps = {
    0: """
        <path data-muscle="trapezio" data-pin-x="45" data-pin-y="20" class="anatomy-trigger-area" d="M 400 170 L 490 170 L 490 220 L 420 220 Z" />
        <path data-muscle="trapezio" data-pin-x="55" data-pin-y="20" class="anatomy-trigger-area" d="M 510 170 L 600 170 L 580 220 L 510 220 Z" />
      """,
    1: """
        <path data-muscle="trapezio" data-pin-x="44" data-pin-y="20" class="anatomy-trigger-area" d="M 400 160 L 480 160 L 480 210 L 420 210 Z" />
        <path data-muscle="trapezio" data-pin-x="52" data-pin-y="20" class="anatomy-trigger-area" d="M 490 160 L 550 160 L 540 210 L 490 210 Z" />
      """,
    2: """
        <path data-muscle="trapezio" data-pin-x="47" data-pin-y="20" class="anatomy-trigger-area" d="M 420 150 L 520 150 L 510 210 L 430 210 Z" />
      """,
    3: """
        <path data-muscle="trapezio" data-pin-x="43" data-pin-y="20" class="anatomy-trigger-area" d="M 380 150 L 470 150 L 470 210 L 400 210 Z" />
        <path data-muscle="trapezio" data-pin-x="53" data-pin-y="20" class="anatomy-trigger-area" d="M 480 150 L 560 150 L 550 210 L 480 210 Z" />
      """,
    4: """
        <path data-muscle="trapezio" data-pin-x="45" data-pin-y="20" class="anatomy-trigger-area" d="M 420 155 L 490 155 L 490 220 L 400 220 Z" />
        <path data-muscle="trapezio" data-pin-x="55" data-pin-y="20" class="anatomy-trigger-area" d="M 510 155 L 580 155 L 600 220 L 510 220 Z" />
      """
}

# We need to process the file frame by frame.
# We'll use regex to find each frame block
def process_frame(match):
    frame_num = int(match.group(1))
    frame_content = match.group(2)
    
    # Remove old trapezio lines
    lines = frame_content.split('\n')
    filtered_lines = [line for line in lines if 'data-muscle="trapezio"' not in line]
    
    # Reconstruct frame content
    new_frame_content = '\n'.join(filtered_lines)
    
    # Insert new trapezio lines at the end (before the closing backtick)
    # The block ends with a closing backtick which we didn't capture in group 2 if we are careful,
    # let's just append it before the last newline
    
    if frame_num in new_traps:
        # Strip trailing whitespace and add the new traps
        new_frame_content = new_frame_content.rstrip() + '\n' + new_traps[frame_num].rstrip() + '\n      '
        
    return f"{frame_num}: `{new_frame_content}`"

# Replace frame content
pattern = re.compile(r'(\d):\s*`([^`]+)`')
new_content = pattern.sub(process_frame, content)

with open('js/imageAnatomyInteractive.js', 'w') as f:
    f.write(new_content)

print("Done replacing paths.")
