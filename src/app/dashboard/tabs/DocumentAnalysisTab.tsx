"use client";

import { useState } from "react";
import { FileSearch, Upload, FileText, Loader2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function DocumentAnalysisTab({ user }: { user: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setReport(null);
      setError("");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze-document", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze document");

      setReport(data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-neon-red" />
            Document Analysis
          </h2>
          <p className="text-sm text-gray-400 mt-1">Upload hospital documents or blood work for Llama AI parsing</p>
        </div>
      </div>
      
      {!report ? (
        <div className="bg-neutral-900 border border-neon-red/30 rounded-3xl p-8 shadow-[0_0_20px_rgba(255,51,102,0.1)] text-center">
          <div className="w-24 h-24 bg-black border border-neon-red/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(255,51,102,0.2)]">
            <FileText className="w-10 h-10 text-neon-red" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Upload Medical Document</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Upload a PDF or image of your clinical notes, test results, or hospital discharge papers.</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-500/50 text-red-400 rounded-xl max-w-md mx-auto text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            {!file ? (
              <label className="px-8 py-4 bg-neon-red/10 text-neon-red border border-neon-red hover:bg-neon-red hover:text-white font-bold rounded-xl cursor-pointer transition-all shadow-[0_0_15px_rgba(255,51,102,0.3)] flex items-center gap-2">
                <Upload className="w-5 h-5" /> Select File
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" />
              </label>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="px-6 py-3 bg-black border border-neutral-800 rounded-xl text-gray-300 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-neon-red" /> {file.name}
                  <button onClick={() => setFile(null)} className="ml-4 text-gray-500 hover:text-white">&times;</button>
                </div>
                <button 
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="px-8 py-4 bg-neon-red text-white font-bold rounded-xl hover:bg-neon-red/80 transition-all shadow-[0_0_20px_rgba(255,51,102,0.4)] disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSearch className="w-5 h-5" />}
                  {isLoading ? "RoboDoc is analyzing..." : "Analyze Document"}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <button 
              onClick={() => { setReport(null); setFile(null); }}
              className="text-gray-400 hover:text-neon-red transition-colors text-sm"
            >
              &larr; Analyze Another Document
            </button>
          </div>

          <div className="bg-neutral-900 border border-neon-red/30 rounded-3xl p-8 shadow-[0_0_20px_rgba(255,51,102,0.15)]">
            <h3 className="text-2xl font-bold text-white mb-4">{report.report_title}</h3>
            <p className="text-gray-300 leading-relaxed mb-8">{report.summary}</p>

            <h4 className="text-lg font-bold text-white mb-4 border-b border-neutral-800 pb-2">Key Findings</h4>
            <div className="grid gap-4 mb-8">
              {report.key_findings?.map((finding: any, idx: number) => (
                <div key={idx} className="bg-black border border-neutral-800 rounded-xl p-5 flex items-start gap-4">
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                    finding.status === "Normal" ? "bg-green-950/50 text-green-400 border-green-500/30" : 
                    finding.status === "Critical" ? "bg-red-950/50 text-red-400 border-red-500/30" : 
                    "bg-amber-950/50 text-amber-400 border-amber-500/30"
                  }`}>
                    {finding.status}
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">{finding.metric}</h5>
                    <p className="text-sm text-gray-400">{finding.notes}</p>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-lg font-bold text-white mb-4 border-b border-neutral-800 pb-2">AI Recommendations</h4>
            <ul className="space-y-3 mb-8">
              {report.recommendations?.map((rec: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-gray-300">
                  <span className="text-neon-red mt-0.5">•</span> {rec}
                </li>
              ))}
            </ul>

            <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-4 flex gap-3 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-400/80">{report.disclaimer}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
