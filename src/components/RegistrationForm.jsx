import { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { API_BASE } from '../api';
import { Trash2 } from 'lucide-react';
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
  const fileInputRef = useRef(null);

  const isFormValid = Object.values(formData).every((val) => val.trim()) && !!excelFile;

  const validateFields = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, val]) => {
      if (!val.trim()) {
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

  const handleSubmit = async () => {
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white shadow-md py-4 px-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 text-center">
          NSS Drug-Free Society Registration Portal
        </h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 px-4 py-12">
        {/* Left Side - Guide */}
        <div className="lg:w-1/2 p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
              Guide to Fill the Form
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-lg font-semibold">1. Select College</h3>
                <p>Choose your college from the dropdown list of approved institutions.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">2. Number of NSS Units</h3>
                <p>Enter the total number of NSS units in your college (1-10).</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">3. Unit Number</h3>
                <p>Select the specific NSS unit number for this registration.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">4. Principal Details</h3>
                <p>Provide the name and mobile number of your college principal.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">5. Excel Upload</h3>
                <p>Upload an Excel file with the required headers: {REQUIRED_HEADERS.join(', ')}. Download the template for the correct format.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">6. Submission</h3>
                <p>Ensure all fields are filled and the Excel file is uploaded before submitting.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="lg:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
              NSS Drug-Free Society Registration
            </h2>
            <div className="space-y-6">
              {/* College Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select College</label>
                <select
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                >
                  <option value="">-- Select Your College --</option>
                  {collegeList.map((college, idx) => (
                    <option key={idx} value={college}>{college}</option>
                  ))}
                </select>
                {errors.college_name && <p className="text-red-600 text-sm mt-1">{errors.college_name}</p>}
              </div>

              {/* NSS Units */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of NSS Units(Funded)</label>
                <input
                  type="number"
                  name="nss_units"
                  value={formData.nss_units}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  min={1}
                  max={10}
                />
                {errors.nss_units && <p className="text-red-600 text-sm mt-1">{errors.nss_units}</p>}
              </div>

              {/* Unit Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Unit Number</label>
                <div className="flex flex-wrap gap-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label key={num} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="unit_number"
                        value={`Unit-${num}`}
                        checked={formData.unit_number === `Unit-${num}`}
                        onChange={handleChange}
                        className="h-5 w-5 text-blue-600 border-gray-300"
                      />
                      <span>Unit-{num}</span>
                    </label>
                  ))}
                </div>
                {errors.unit_number && <p className="text-red-600 text-sm mt-1">{errors.unit_number}</p>}
              </div>

              {/* Principal Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Principal Name</label>
                <input
                  type="text"
                  name="principal_name"
                  value={formData.principal_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
                {errors.principal_name && <p className="text-red-600 text-sm mt-1">{errors.principal_name}</p>}
              </div>

              {/* Principal Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Principal Mobile</label>
                <input
                  type="tel"
                  name="principal_mobile"
                  value={formData.principal_mobile}
                  onChange={handleChange}
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
                {errors.principal_mobile && <p className="text-red-600 text-sm mt-1">{errors.principal_mobile}</p>}
              </div>

              <div className=''>
                <label className="block text-sm font-medium text-gray-700 mb-2">Click Here To Download Template</label>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="w-full  px-6 py-3 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Download Template
                </button>
              </div>

              {/* Excel Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Excel</label>

                <div className='flex gap-2'>
                  <label className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                    <input
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <span className="text-gray-500">
                      {excelFile ? excelFile.name : 'Click to upload Excel file'}
                    </span>
                  </label>
                  {excelFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setExcelFile(null);
                        fileInputRef.current.value = '';
                        toast.success('Excel file removed');
                      }}
                      className="mt-2 text-red-500 hover:underline text-sm"
                    >
                     <Trash2 />
                    </button>
                  )}
                </div>
                {errors.excel && <p className="text-red-600 text-sm mt-1">{errors.excel}</p>}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  className={`w-full  px-6 py-3 rounded-lg font-medium text-white transition duration-200 ${isFormValid
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                  Submit
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}