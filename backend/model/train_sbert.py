# train_sbert.py
import csv
import os
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader
from sklearn.model_selection import train_test_split

# ===== Config =====
TRAIN_CSV = "train_pairs.csv"
MODEL_NAME = "all-MiniLM-L6-v2"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../models/skill_sbert")
BATCH_SIZE = 32
EPOCHS = 12           # increase epochs for better alignment
MAX_SEQ_LENGTH = 128
LR = 2e-5

# ===== Load CSV pairs =====
# ===== Load CSV pairs =====
def load_pairs(csv_path):
    pairs = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            # skip empty or malformed rows
            if not row or len(row) < 2:
                continue
            text, skill = row[0].strip(), row[1].strip()
            if text and skill:
                pairs.append((text, skill))
    return pairs


# ===== Main Training =====
def main():
    pairs = load_pairs(TRAIN_CSV)
    print(f"✅ Loaded {len(pairs)} training pairs.")

    # Train/validation split
    train_pairs, val_pairs = train_test_split(pairs, test_size=0.1, random_state=42)

    model = SentenceTransformer(MODEL_NAME)
    model.max_seq_length = MAX_SEQ_LENGTH

    # Prepare InputExample objects
    train_examples = [InputExample(texts=[t, s]) for t, s in train_pairs]
    val_examples = [InputExample(texts=[t, s]) for t, s in val_pairs]

    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=BATCH_SIZE)
    train_loss = losses.MultipleNegativesRankingLoss(model)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("🚀 Starting SBERT training ...")
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=EPOCHS,
        warmup_steps=max(100, int(0.1 * len(train_dataloader))),
        output_path=OUTPUT_DIR,
        optimizer_params={'lr': LR},
        show_progress_bar=True
    )
    print(f"✅ SBERT training complete. Model saved to {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
