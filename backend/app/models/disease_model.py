# backend/app/models/disease_model.py

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

MODEL_PATH = "app/models/disease_model.pth"
NUM_CLASSES = 10  # update if needed

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Define model class again for loading
class DiseaseModel(nn.Module):
    def __init__(self, num_classes):
        super(DiseaseModel, self).__init__()
        self.model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        in_features = self.model.fc.in_features
        self.model.fc = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.model(x)

model = None  # lazy init

def load_model():
    global model
    if model is None:
        model = DiseaseModel(num_classes=NUM_CLASSES).to(device)
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model.eval()
    return model

def predict_disease(image: Image.Image):
    model = load_model()
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor()
    ])
    img_tensor = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        outputs = model(img_tensor)
        _, predicted = torch.max(outputs.data, 1)
    return predicted.item()
# Updated 2026-07-13 19:25:55
# Updated 2026-07-13 19:25:58
# Updated 2026-07-13 19:26:02
# Updated 2026-07-13 19:32:44
# Updated 2026-07-13 19:32:57
# Updated 2026-07-13 19:32:59
# Updated 2026-07-13 19:33:05
# Updated 2026-07-13 19:33:08
# Updated 2026-07-13 19:33:11
# Updated 2026-07-13 19:33:13
# Updated 2026-07-13 19:33:26
# Updated 2026-07-13 19:33:30
# Updated 2026-07-13 19:33:31
# Updated 2026-07-13 19:33:40
# Updated 2026-07-13 19:33:44
# Updated 2026-07-13 19:33:48
# Updated 2026-07-13 19:33:53
# Updated 2026-07-13 19:33:55
# Updated 2026-07-13 19:34:00
# Updated 2026-07-13 19:34:09
# Updated 2026-07-13 19:34:16
# Updated 2026-07-13 19:34:21
# Updated 2026-07-13 19:34:22
# Updated 2026-07-13 19:34:23
# Updated 2026-07-13 19:34:27
# Updated 2026-07-13 19:38:54
# Updated 2026-07-13 19:38:56
# Updated 2026-07-13 19:39:01
# Updated 2026-07-13 19:39:19
# Updated 2026-07-13 19:39:25
# Updated 2026-07-13 19:39:25
# Updated 2026-07-13 19:39:34
# Updated 2026-07-13 19:39:42
