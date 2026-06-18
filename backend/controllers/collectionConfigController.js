import CollectionConfig from "../models/collectionConfigModel.js";

const DEFAULT_CONFIGS = [
  {
    key: "midnight",
    name: "Midnight Chaos",
    subtitle: "COLLECTION 01",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
  },
  {
    key: "urban",
    name: "Urban Future",
    subtitle: "COLLECTION 02",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop"
  },
  {
    key: "future",
    name: "Future Streets",
    subtitle: "COLLECTION 03",
    imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop"
  },
  {
    key: "limited",
    name: "Limited Drop",
    subtitle: "COLLECTION 04",
    imageUrl: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=800&auto=format&fit=crop"
  }
];

export const getCollectionConfigs = async (req, res) => {
  try {
    let configs = await CollectionConfig.find();
    if (configs.length === 0) {
      // Seed default configs
      configs = await CollectionConfig.insertMany(DEFAULT_CONFIGS);
    }
    res.status(200).json({ success: true, configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCollectionConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const { name, subtitle, imageUrl } = req.body;

    let config = await CollectionConfig.findOne({ key });
    if (!config) {
      return res.status(404).json({ success: false, message: "Collection config not found" });
    }

    if (name) config.name = name;
    if (subtitle !== undefined) config.subtitle = subtitle;
    
    // If a file was uploaded via multer, use its secure url from Cloudinary
    if (req.file && req.file.path) {
      config.imageUrl = req.file.path;
    } else if (imageUrl) {
      config.imageUrl = imageUrl;
    }

    await config.save();
    res.status(200).json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCollectionConfig = async (req, res) => {
  try {
    const { key, name, subtitle, imageUrl } = req.body;
    if (!key || !name) {
      return res.status(400).json({ success: false, message: "Key and Name are required" });
    }

    const trimmedKey = key.trim().toLowerCase();
    const existing = await CollectionConfig.findOne({ key: trimmedKey });
    if (existing) {
      return res.status(400).json({ success: false, message: "Collection key must be unique" });
    }

    let finalImageUrl = "";
    if (req.file && req.file.path) {
      finalImageUrl = req.file.path;
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
    } else {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const newConfig = new CollectionConfig({
      key: trimmedKey,
      name,
      subtitle: subtitle || "",
      imageUrl: finalImageUrl,
    });

    await newConfig.save();
    res.status(201).json({ success: true, config: newConfig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCollectionConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const deleted = await CollectionConfig.findOneAndDelete({ key });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Collection config not found" });
    }
    res.status(200).json({ success: true, message: "Collection deleted successfully", config: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

