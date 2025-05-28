def train_and_save_model():
    import os
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torchvision import datasets, transforms, models
    from torch.utils.data import Subset, DataLoader
    from sklearn.model_selection import train_test_split
    import numpy as np

    # Configuration
    DATA_DIR = 'data/plantvillage'  # change if your path is different
    MODEL_PATH = 'app/models/disease_model.pth'
    BATCH_SIZE = 32
    EPOCHS = 2
    SUBSET_SIZE = 500
    NUM_CLASSES = 10  # adjust based on your dataset

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Data transforms
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])

    # Load full dataset
    full_dataset = datasets.ImageFolder(DATA_DIR, transform=transform)
    print("Original dataset size:", len(full_dataset))

    # Random subset for fast training
    indices = list(range(len(full_dataset)))
    subset_indices = np.random.choice(indices, SUBSET_SIZE, replace=False)
    subset_dataset = Subset(full_dataset, subset_indices)

    # Split subset into train and val
    train_indices, val_indices = train_test_split(list(range(SUBSET_SIZE)), test_size=0.2, random_state=42)
    train_dataset = Subset(subset_dataset, train_indices)
    val_dataset = Subset(subset_dataset, val_indices)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE)

    # Define model
    class DiseaseModel(nn.Module):
        def __init__(self, num_classes):
            super(DiseaseModel, self).__init__()
            self.model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
            in_features = self.model.fc.in_features
            self.model.fc = nn.Linear(in_features, num_classes)

        def forward(self, x):
            return self.model(x)

    model = DiseaseModel(num_classes=NUM_CLASSES).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # Training loop
    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()

        print(f"Epoch [{epoch+1}/{EPOCHS}], Loss: {running_loss/len(train_loader):.4f}")

    # Validation accuracy
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    accuracy = 100 * correct / total
    print(f"Validation Accuracy: {accuracy:.2f}%")

    # Save model
    torch.save(model.state_dict(), MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


# Train only when directly running this script
if __name__ == "__main__":
    train_and_save_model()
