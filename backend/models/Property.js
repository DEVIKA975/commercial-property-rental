import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  // --- CORE IDENTITY ---
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Office', 'Retail', 'Warehouse', 'Coworking', 'Other'],
    default: 'Office' 
  },
  tag: { type: String, default: 'For Lease' }, // e.g. "High Street", "Grade A"
  
  // --- LOCATION ---
  location: { type: String, required: true }, // Short location for cards
  address: { type: String }, // Full address with floor/unit
  nearby: { type: String }, // Transport hubs, landmarks

  // --- VISUALS ---
  imageUrl: { type: String, required: true },
  videoUrl: { type: String },
  gallery: [String],

  // --- FINANCIALS ---
  price: { type: String, required: true }, // Display string e.g. "$45/sqft"
  financials: {
    type: { type: String, enum: ['Lease', 'Sale'] },
    rent: String,          // Rent per sqft/month
    cam: String,           // Common Area Maintenance
    deposit: String,       // Security Deposit (Months)
    lockIn: String,        // Lock-in Period
    notice: String,        // Notice Period
    hiddenCosts: String    // Parking, Utility, Stamp Duty
  },

  // --- SPECS & DETAILS (Flexible based on Category) ---
  details: {
    // Area Metrics
    carpetArea: String,
    superArea: String,
    efficiency: String, // Floor Ratio %

    // Office/Retail Specs
    floorPlan: String,    // Open, Cabins, Layout type
    condition: String,    // Bare Shell, Warm Shell, Furnished
    furnishing: String,   // Plug & Play details
    
    // Retail Specific
    frontage: String,     // e.g. "20 ft wide"
    locationType: String, // High Street, Mall, Mixed Use
    footfall: String,     // Catchment details
    floorLevel: String,   // Ground, Basement, etc.
    fbProvisions: String, // Exhaust, Gas, Drainage (Yes/No/Details)

    // Warehouse/Industry Specific
    roadWidth: String,    // For containers
    clearHeight: String,  // e.g. "30 ft"
    floorLoad: String,    // Tons per sq meter
    dockLevelers: String, // Count
    powerLoad: String,    // kVA/MVA
    water: String,        // Borewell/Municipal
    zoneCategory: String, // Light/Heavy Industrial

    // Co-working Specific
    totalCapacity: String,
    seatMix: String,      // Hot desks, Cabins count
    internet: String,     // Speed/Leased Line
    amenities: String     // Gaming, Coffee, Events
  },

  // --- LEGAL ---
  legal: {
    ownership: String,    // Title check
    ocStatus: String,     // Occupancy Certificate
    zoning: String,       // Commercial/Industrial
    noc: String           // Fire/Society NOC
  },

  description: { type: String },
  
  // Floor Plans (Array for multiple floors)
  floors: [{
    title: String,
    area: String,
    availability: String,
    image: String,
    notes: String
  }],

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Property', PropertySchema);