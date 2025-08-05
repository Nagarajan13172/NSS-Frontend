import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUniversity, FaBuilding, FaUsers, FaDownload, FaInfoCircle, FaUser, FaPhone } from 'react-icons/fa';
import { Trash2 } from 'lucide-react';
import { API_BASE } from '../api';
import Header from './Header'; // Import the Header component

const collegeList = [
  "College of Engineering, Guindy", "PSG College of Technology", "SSN College of Engineering",
  "Thiagarajar College of Engineering", "Kumaraguru College of Technology", "Sona College of Technology",
  "Coimbatore Institute of Technology", "Government College of Technology", "Velammal Engineering College",
  "Meenakshi Sundararajan Engineering College", "Sri Sairam Engineering College", "Rajalakshmi Engineering College",
  "K.L.N. College of Engineering", "RMK Engineering College", "Panimalar Engineering College",
  "Easwari Engineering College", "KCG College of Technology", "St. Joseph’s College of Engineering",
  "Dr. Mahalingam College of Engineering", "Bannari Amman Institute of Technology", "Kongu Engineering College",
  "Government College of Engineering, Salem", "Sri Krishna College of Engineering", "Adhiyamaan College of Engineering",
  "Annamalai University", "Anna University Regional Campus", "VIT Vellore",
  "SRM Institute of Science and Technology", "SASTRA University", "Hindustan Institute of Technology",
  "Saveetha Engineering College", "Jeppiaar Engineering College", "Vel Tech University",
  "Dr. MGR University", "Amrita Vishwa Vidyapeetham", "Chennai Institute of Technology",
  "Narayanaguru College of Engineering", "Dhanalakshmi Srinivasan Engineering College", "Oxford Engineering College",
  "Paavai Engineering College", "Mepco Schlenk Engineering College", "PSNA College of Engineering",
  "Velalar College of Engineering", "Shree Venkateshwara Hi-Tech", "Selvam College of Technology",
  "SNS College of Technology", "SKCET", "Dr. NGP Institute of Technology", "Sri Ramakrishna Engineering College"
];

const REQUIRED_HEADERS = [
  'Name', 'Degree', 'Year', 'DOB', 'EmailId', 'Aadhar Number',
  'Contact No', 'Gender', 'Category(SC/ST/OBC)'
];

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    college_name: '',
    nss_units: '',
    unit_number: '',
    principal_name: '',
    principal_mobile: '',
  });
  const [excelFile, setExcelFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [units, setUnits] = useState([]);
  const [particles, setParticles] = useState([]);
  const fileInputRef = useRef(null);

  const isFormValid = Object.values(formData).every((val) => String(val).trim()) && !!excelFile;

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 60 }, () => ({
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 20 + 12,
        speedX: (Math.random() - 0.5) * 6,
        speedY: (Math.random() - 0.5) * 6,
        color: `hsl(${Math.random() * 60 + 120}, 85%, 75%)`,
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => {
          let newX = p.x + p.speedX;
          let newY = p.y + p.speedY;
          if (newX < 0 || newX > window.innerWidth) p.speedX *= -1;
          if (newY < 0 || newY > window.innerHeight) p.speedY *= -1;
          return {
            ...p,
            x: newX,
            y: newY,
            size: p.size + (Math.random() - 0.5) * 0.6,
          };
        })
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const validateFields = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, val]) => {
      if (!String(val).trim()) {
        newErrors[key] = `${key.replace('_', ' ')} is required`;
      }
    });
    if (!excelFile) newErrors.excel = 'Excel file is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (value.trim()) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleUnitsChange = (e) => {
    const numUnits = parseInt(e.target.value) || 0;
    setFormData({ ...formData, nss_units: numUnits });
    setUnits(Array.from({ length: numUnits }, (_, i) => i + 1));
    if (numUnits) setErrors((prev) => ({ ...prev, nss_units: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];

      const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
      if (missing.length > 0) {
        toast.error(`Missing headers: ${missing.join(', ')}`);
        setExcelFile(null);
        fileInputRef.current.value = '';
      } else {
        toast.success('Excel file validated!');
        setExcelFile(file);
        setErrors((prev) => ({ ...prev, excel: '' }));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    data.append('excel', excelFile);

    try {
      await axios.post(`${API_BASE}/register`, data);
      toast.success('Form has been Submitted successfully! Thanks for registering.');
      setFormData({
        college_name: '',
        nss_units: '',
        unit_number: '',
        principal_name: '',
        principal_mobile: '',
      });
      setExcelFile(null);
      setUnits([]);
      fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      toast.error('Submission failed. Try again.');
    }
  };


  const downloadTemplate = () => {
    window.open(`${API_BASE}/template`, '_blank');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-emerald-200 to-teal-200 relative overflow-hidden pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap');
            .font-inter { font-family: 'Inter', sans-serif; }
            .font-poppins { font-family: 'Poppins', sans-serif; }
          `}
        </style>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="natureGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 0.55 }} />
              <stop offset="100%" style={{ stopColor: '#34D399', stopOpacity: 0.55 }} />
            </linearGradient>
          </defs>
          <g>
            <path
              d="M0,1080 C150,950 350,900 550,950 C750,1000 950,900 1150,950 C1350,1000 1550,900 1920,950"
              fill="url(#natureGradient)"
              opacity="0.35"
            />
            <path
              d="M100,900 C250,750 450,800 650,750 C850,700 1050,800 1250,750 C1450,700 1650,800 1900,750"
              fill="url(#natureGradient)"
              opacity="0.3"
            />
            <path
              d="M150,250 Q250,150 350,250 T550,250 Q650,150 750,250 T950,250 Q1050,150 1150,250 T1350,250"
              fill="none"
              stroke="url(#natureGradient)"
              strokeWidth="16"
              opacity="0.45"
            />
            <path
              d="M50,450 Q150,350 250,450 T450,450 Q550,350 650,450 T850,450 Q950,350 1050,450 T1250,450"
              fill="none"
              stroke="url(#natureGradient)"
              strokeWidth="14"
              opacity="0.4"
            />
            <path
              d="M250,650 Q350,550 450,650 T650,650 Q750,550 850,650 T1050,650"
              fill="none"
              stroke="url(#natureGradient)"
              strokeWidth="12"
              opacity="0.35"
            />
          </g>
        </svg>
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 0.7, scale: 0 }}
                animate={{
                  x: particle.x,
                  y: particle.y,
                  scale: particle.size / 10,
                  opacity: 0.65,
                }}
                transition={{ duration: 0.03, ease: 'linear' }}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  background: particle.color,
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.85)',
                }}
              />
            ))}
          </AnimatePresence>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl font-inter font-extrabold text-emerald-900 text-center mb-10 tracking-tight shadow-text"
        >
          NSS Drug-Free Registration Form
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border-4 border-blue-500/75 ring-4 ring-blue-300/55 hover:ring-blue-400/75 transition-all duration-300"
          >
            <h3 className="text-3xl font-black text-blue-900 mb-8 font-inter flex items-center gap-4">
              <FaInfoCircle className="text-blue-800 text-3xl" />
              Guidelines for NSS Registration
            </h3>
            <div className="space-y-6 text-gray-800 font-poppins text-lg">
              <h4 className="text-xl font-semibold text-blue-800">Step-by-Step Form Filling Instructions:</h4>
              <ol className="list-decimal ml-6 space-y-4">
                <li>Select your college from the dropdown list of approved institutions.</li>
                <li>Enter the total number of NSS units in your college (1-10).</li>
                <li>Select the specific NSS unit number for this registration.</li>
                <li>Provide the name and a valid 10-digit mobile number of your college principal.</li>
                <li>Download the Excel template and fill it with the required headers: {REQUIRED_HEADERS.join(', ')}.</li>
                <li>Upload the completed .xlsx file for each unit via the respective unit section.</li>
                <li>Review all entered data and uploaded files before submitting to ensure accuracy.</li>
              </ol>
              <h4 className="text-xl font-semibold text-blue-800 mt-6">Excel Template Guidelines:</h4>
              <ul className="list-disc ml-6 space-y-4">
                <li>Download the template using the “Download Excel Template” button below.</li>
                <li>Ensure the template includes columns for {REQUIRED_HEADERS.join(', ')}.</li>
                <li>Use only .xlsx format; other formats (e.g., .xls, .csv) will not be accepted.</li>
                <li>Fill all required fields in the template to avoid upload errors.</li>
                <li>Save and upload the file for each unit separately in the unit sections.</li>
              </ul>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border-4 border-emerald-500/75 ring-4 ring-emerald-300/55 hover:ring-emerald-400/75 transition-all duration-300"
          >
            <motion.h2
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-3xl font-black text-emerald-900 mb-8 font-inter tracking-tight flex items-center gap-4"
            >
              <FaUsers className="text-3xl text-emerald-800" />
              NSS Registration Form
            </motion.h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaUniversity className="text-emerald-800 text-2xl" />
                  Name of the College
                </label>
                <select
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                  required
                >
                  <option value="">-- Select Your College --</option>
                  {collegeList.map((college, idx) => (
                    <option key={idx} value={college}>{college}</option>
                  ))}
                </select>
                {errors.college_name && <p className="text-red-600 text-sm mt-1">{errors.college_name}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaBuilding className="text-emerald-800 text-2xl" />
                  Number of NSS Units (Funded)
                </label>
                <input
                  type="number"
                  name="nss_units"
                  value={formData.nss_units}
                  onChange={handleUnitsChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                  placeholder="Enter number of units"
                  min="1"
                  max="10"
                  required
                />
                {errors.nss_units && <p className="text-red-600 text-sm mt-1">{errors.nss_units}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaUsers className="text-emerald-800 text-2xl" />
                  Select Unit Number
                </label>
                <div className="flex flex-wrap gap-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label key={num} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="unit_number"
                        value={`Unit-${num}`}
                        checked={formData.unit_number === `Unit-${num}`}
                        onChange={handleChange}
                        className="h-5 w-5 text-emerald-600 border-gray-200 focus:ring-emerald-500"
                      />
                      <span className="font-poppins text-gray-800">Unit-{num}</span>
                    </label>
                  ))}
                </div>
                {errors.unit_number && <p className="text-red-600 text-sm mt-1">{errors.unit_number}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaUser className="text-emerald-800 text-2xl" />
                  College Principal Name
                </label>
                <input
                  type="text"
                  name="principal_name"
                  value={formData.principal_name}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                  placeholder="Enter principal name"
                  required
                />
                {errors.principal_name && <p className="text-red-600 text-sm mt-1">{errors.principal_name}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaPhone className="text-emerald-800 text-2xl" />
                  Principal Mobile
                </label>
                <input
                  type="tel"
                  name="principal_mobile"
                  value={formData.principal_mobile}
                  onChange={handleChange}
                  maxLength={10}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                  placeholder="Enter mobile number"
                  pattern="[0-9]{10}"
                  required
                />
                {errors.principal_mobile && <p className="text-red-600 text-sm mt-1">{errors.principal_mobile}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaDownload className="text-emerald-800 text-2xl" />
                  Download Excel Template
                </label>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 rounded-xl font-bold font-poppins text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <FaDownload className="text-2xl" />
                  Download Excel Template
                </button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaUsers className="text-emerald-800 text-2xl" />
                  Upload Excel
                </label>
                <div className="flex gap-2">
                  <label className="flex items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300">
                    <input
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <span className="font-poppins text-gray-500 text-lg">
                      {excelFile ? excelFile.name : 'Click to upload Excel file'}
                    </span>
                  </label>
                  {excelFile && (
                    <motion.button
                      type="button"
                      onClick={() => {
                        setExcelFile(null);
                        fileInputRef.current.value = '';
                        toast.success('Excel file removed');
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <Trash2 className="w-6 h-6" />
                    </motion.button>
                  )}
                </div>
                {errors.excel && <p className="text-red-600 text-sm mt-1">{errors.excel}</p>}
              </motion.div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(16,185,129,0.75)' }}
                whileTap={{ scale: 0.97 }}
                disabled={!isFormValid}
                className={`w-full bg-gradient-to-r from-emerald-700 to-teal-700 text-white py-4 rounded-xl font-bold font-poppins text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                  !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaUsers className="text-2xl" />
                Submit Form
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}