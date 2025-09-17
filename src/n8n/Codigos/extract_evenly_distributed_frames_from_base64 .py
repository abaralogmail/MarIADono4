import cv2
import numpy as np
import base64

def extract_evenly_distributed_frames_from_base64(base64_string, max_frames=90):
    # Decode the Base64 string into bytes
    video_bytes = base64.b64decode(base64_string)
    
    # Write the bytes to a temporary file
    video_path = '/tmp/temp_video.mp4'
    with open(video_path, 'wb') as video_file:
        video_file.write(video_bytes)
    
    # Open the video file using OpenCV
    video_capture = cv2.VideoCapture(video_path)
    
    # Get the total number of frames in the video
    total_frames = int(video_capture.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Calculate the step size to take 'max_frames' evenly distributed frames
    if max_frames > 1:
        step_size = (total_frames - 1) // (max_frames - 1)
    else:
        step_size = 0
    
    # List to store selected frames as base64
    selected_frames_base64 = []
    
    for i in range(0, total_frames, step_size):
        # Set the current frame position
        video_capture.set(cv2.CAP_PROP_POS_FRAMES, i)
        
        # Read the frame
        ret, frame = video_capture.read()
        
        if ret:
            # Convert frame (NumPy array) to a Base64 string
            frame_base64 = convert_frame_to_base64(frame)
            selected_frames_base64.append(frame_base64)
            
            if len(selected_frames_base64) >= max_frames:
                break
    
    # Release the video capture object
    video_capture.release()
    
    return selected_frames_base64

def convert_frame_to_base64(frame):
    # Convert the frame (NumPy array) to JPEG format
    ret, buffer = cv2.imencode('.jpg', frame)
    if not ret:
        return None
    
    # Encode JPEG image to Base64
    frame_base64 = base64.b64encode(buffer).decode('utf-8')
    return frame_base64

# Example usage:
# base64_video = "your_base64_encoded_video_string_here"
# frames_base64 = extract_evenly_distributed_frames_from_base64(base64_video, max_frames=90)
# print({ "output": frames_base64 })