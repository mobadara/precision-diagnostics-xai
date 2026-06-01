import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { LogOut, Activity, UploadCloud, XCircle, CheckCircle2, AlertTriangle, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function Dashboard() {
    const { user, logout } = useAuth();
    
    // UI State
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    // API State
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    
    // Feedback State
    const [feedbackStatus, setFeedbackStatus] = useState(null); // null, 'loading', 'success', 'error'

    const inputRef = useRef(null);

    // --- Drag and Drop Handlers ---
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file) => {
        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file (JPEG/PNG).");
            return;
        }
        setError(null);
        setResult(null);
        setFeedbackStatus(null);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
        setFeedbackStatus(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    // --- API Integration ---
    const analyzeXRay = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError(null);
        setFeedbackStatus(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const API_URL = import.meta.env.VITE_API_URI || "http://localhost:8000";
            const response = await axios.post(`${API_URL}/api/v1/predict`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setResult(response.data);
        } catch (err) {
            console.error("API Error:", err);
            setError("Failed to connect to the diagnostic engine. Is the Hugging Face space running?");
        } finally {
            setLoading(false);
        }
    };

    // --- A/B Testing Feedback Loop ---
    const submitFeedback = async (isAgree) => {
        if (!result?.record_id) return;
        setFeedbackStatus('loading');
        
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
            
            // If the doctor agrees, override is FALSE. If they disagree, override is TRUE.
            const payload = {
                physician_override: !isAgree,
                notes: isAgree ? "Agreed with AI" : "Physician disagreed with AI diagnosis"
            };

            await axios.put(`${API_URL}/api/v1/override/${result.record_id}`, payload);
            setFeedbackStatus('success');
        } catch (err) {
            console.error("Feedback Error:", err);
            setFeedbackStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-navy text-white p-4 shadow-md flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-trust-cyan" />
                    <span className="font-bold tracking-wide">PNEUMONIA VISION AI</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-200">Dr. {user?.name.replace('Dr. ', '')}</span>
                    <button onClick={logout} className="flex items-center gap-2 hover:text-red-300 transition-colors text-sm font-medium">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto p-6 mt-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-navy">Diagnostic Workbench</h1>
                    <p className="text-gray-500 mt-2">Upload a pediatric chest X-Ray for automated pneumonia screening.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Upload & Preview */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Patient Scan</h2>
                        
                        {!previewUrl ? (
                            <div 
                                className={`flex-1 relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all ${dragActive ? 'border-trust-cyan bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input 
                                    ref={inputRef}
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleChange} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">Drag & Drop X-Ray image here</p>
                                <p className="text-gray-400 text-sm mt-1">or click to browse files</p>
                            </div>
                        ) : (
                            <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-200 bg-black flex justify-center items-center">
                                <img src={previewUrl} alt="X-Ray Preview" className="max-h-full max-w-full object-contain" />
                                <button 
                                    onClick={clearSelection}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 text-critical-red flex items-center gap-2 rounded-md border border-red-100 text-sm">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button 
                            onClick={analyzeXRay}
                            disabled={!selectedFile || loading}
                            className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition-all flex justify-center items-center gap-2 ${!selectedFile || loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-clinical-teal hover:bg-teal-800 shadow-md'}`}
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Scan...</>
                            ) : (
                                "Run AI Diagnostics"
                            )}
                        </button>
                    </div>

                    {/* Right Column: AI Results */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Analysis Report</h2>
                        
                        {!result && !loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <Activity className="w-16 h-16 mb-4 opacity-20" />
                                <p>Awaiting scan data...</p>
                            </div>
                        ) : loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-clinical-teal">
                                <div className="w-16 h-16 border-4 border-teal-100 border-t-clinical-teal rounded-full animate-spin mb-4"></div>
                                <p className="font-medium animate-pulse">Running DenseNet121 Inference...</p>
                            </div>
                        ) : result && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
                                {/* Status Badge */}
                                <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${result.prediction === 'PNEUMONIA' ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
                                    {result.prediction === 'PNEUMONIA' ? (
                                        <AlertTriangle className="w-8 h-8 text-critical-red" />
                                    ) : (
                                        <CheckCircle2 className="w-8 h-8 text-surgical-mint" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Detection Result</p>
                                        <h3 className={`text-2xl font-bold ${result.prediction === 'PNEUMONIA' ? 'text-critical-red' : 'text-surgical-mint'}`}>
                                            {result.prediction}
                                        </h3>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="text-sm text-gray-500">Confidence</p>
                                        <p className="text-xl font-bold text-gray-800">{(result.confidence * 100).toFixed(1)}%</p>
                                    </div>
                                </div>

                                {/* Heatmap Image */}
                                <div className="mb-6">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Grad-CAM Explainability Heatmap</p>
                                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-black flex justify-center items-center h-56">
                                        <img src={result.heatmap_url} alt="AI Heatmap" className="max-h-full max-w-full object-contain" />
                                    </div>
                                </div>

                                {/* The New Feedback Loop */}
                                <div className="mt-auto border-t border-gray-100 pt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-3 text-center">Do you agree with this AI diagnosis?</p>
                                    
                                    {feedbackStatus === 'success' ? (
                                        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-green-50 text-surgical-mint rounded-lg border border-green-100">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-medium">Feedback recorded. Thank you.</span>
                                        </div>
                                    ) : (
                                        <div className="flex gap-4 justify-center">
                                            <button 
                                                onClick={() => submitFeedback(true)}
                                                disabled={feedbackStatus === 'loading'}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-green-200 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-semibold disabled:opacity-50"
                                            >
                                                <ThumbsUp className="w-4 h-4" /> Agree
                                            </button>
                                            <button 
                                                onClick={() => submitFeedback(false)}
                                                disabled={feedbackStatus === 'loading'}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-red-200 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-semibold disabled:opacity-50"
                                            >
                                                <ThumbsDown className="w-4 h-4" /> Disagree
                                            </button>
                                        </div>
                                    )}
                                    {feedbackStatus === 'error' && (
                                        <p className="text-xs text-critical-red mt-2 text-center">Failed to connect to database.</p>
                                    )}
                                </div>

                                <div className="mt-4 text-xs text-gray-400 font-mono text-center">
                                    Record ID: {result.record_id}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}