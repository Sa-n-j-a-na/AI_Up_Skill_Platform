from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("models/skill_sbert")

a = "AWS"
b = "Cloud"

emb_a = model.encode(a, convert_to_tensor=True)
emb_b = model.encode(b, convert_to_tensor=True)

sim = util.cos_sim(emb_a, emb_b)
print(sim)
