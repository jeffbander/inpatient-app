"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import * as XLSX from "xlsx";

// Patient type for the tracker
interface Patient {
  _id: Id<"patients">;
  _creationTime: number;
  userId: string;
  service: string;
  patientName: string;
  mrn: string;
  primaryDiagnosis: string;
  clinicalStatus: string;
  dispositionConsiderations: string;
  strikeAction: string;
  createdAt: number;
  updatedAt: number;
}

const STRIKE_ACTION_OPTIONS = [
  "",
  "Monitor",
  "Monitor - Not",
  "Monitor - Palliative",
  "Monitor - Comfort care",
  "Expedite D/C",
];

const SERVICE_OPTIONS = [
  "",
  "Cath",
  "EP",
  "CCU",
  "Team C/ADS",
  "MICU",
  "SICU",
  "Neuro ICU",
  "Cards",
];

interface PatientFormData {
  service: string;
  patientName: string;
  mrn: string;
  primaryDiagnosis: string;
  clinicalStatus: string;
  dispositionConsiderations: string;
  strikeAction: string;
}

const emptyFormData: PatientFormData = {
  service: "",
  patientName: "",
  mrn: "",
  primaryDiagnosis: "",
  clinicalStatus: "",
  dispositionConsiderations: "",
  strikeAction: "",
};

// Note: Types will be auto-generated when Convex deploys the patients schema
// eslint-disable-next-line
const patientsApi = (api as any).patients;

export function PatientTracker() {
  const patients = useQuery(patientsApi?.getPatients) as Patient[] | undefined;
  const createPatient = useMutation(patientsApi?.createPatient) as (args: PatientFormData) => Promise<unknown>;
  const updatePatient = useMutation(patientsApi?.updatePatient) as (args: PatientFormData & { patientId: Id<"patients"> }) => Promise<void>;
  const deletePatient = useMutation(patientsApi?.deletePatient) as (args: { patientId: Id<"patients"> }) => Promise<void>;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"patients"> | null>(null);
  const [formData, setFormData] = useState<PatientFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updatePatient({
          patientId: editingId,
          ...formData,
        });
      } else {
        await createPatient(formData);
      }
      setFormData(emptyFormData);
      setEditingId(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving patient:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (patient: Patient) => {
    setFormData({
      service: patient.service,
      patientName: patient.patientName,
      mrn: patient.mrn,
      primaryDiagnosis: patient.primaryDiagnosis,
      clinicalStatus: patient.clinicalStatus,
      dispositionConsiderations: patient.dispositionConsiderations,
      strikeAction: patient.strikeAction,
    });
    setEditingId(patient._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (patientId: Id<"patients">) => {
    if (!confirm("Are you sure you want to remove this patient?")) return;
    try {
      await deletePatient({ patientId });
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  const handleExportExcel = () => {
    if (!patients || patients.length === 0) {
      alert("No patients to export");
      return;
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

    // Prepare data for Excel matching the screenshot format
    const excelData = patients.map((p) => ({
      Service: p.service,
      Patient: p.patientName,
      MRN: p.mrn,
      "Primary Diagnosis": p.primaryDiagnosis,
      "Clinical Status": p.clinicalStatus,
      "Disposition Considerations": p.dispositionConsiderations,
      "Strike Action": p.strikeAction,
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws["!cols"] = [
      { wch: 12 }, // Service
      { wch: 15 }, // Patient
      { wch: 10 }, // MRN
      { wch: 30 }, // Primary Diagnosis
      { wch: 35 }, // Clinical Status
      { wch: 45 }, // Disposition Considerations
      { wch: 20 }, // Strike Action
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ICU Patients");

    // Generate filename with date
    const filename = `ICU_Patient_Tracker_${dateStr.replace(/\//g, "-")}.xlsx`;

    // Download the file
    XLSX.writeFile(wb, filename);
  };

  const handleCancel = () => {
    setFormData(emptyFormData);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const getStrikeActionColor = (action: string) => {
    switch (action) {
      case "Monitor":
        return "bg-blue-100 text-blue-800";
      case "Monitor - Not":
        return "bg-yellow-100 text-yellow-800";
      case "Monitor - Palliative":
        return "bg-purple-100 text-purple-800";
      case "Monitor - Comfort care":
        return "bg-green-100 text-green-800";
      case "Expedite D/C":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!patients) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">ICU Patient Tracker</h2>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">ICU Patient Tracker</h2>
          <p className="text-sm text-gray-500">
            Date: {new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            disabled={patients.length === 0}
            className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Export to Excel
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Add Patient
          </button>
        </div>
      </div>

      {/* Patient Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingId ? "Edit Patient" : "Add New Patient"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    {SERVICE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Service"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MRN
                  </label>
                  <input
                    type="text"
                    name="mrn"
                    value={formData.mrn}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strike Action
                  </label>
                  <select
                    name="strikeAction"
                    value={formData.strikeAction}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    {STRIKE_ACTION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option || "Select Action"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Diagnosis
                </label>
                <input
                  type="text"
                  name="primaryDiagnosis"
                  value={formData.primaryDiagnosis}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinical Status
                </label>
                <textarea
                  name="clinicalStatus"
                  value={formData.clinicalStatus}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disposition Considerations
                </label>
                <textarea
                  name="dispositionConsiderations"
                  value={formData.dispositionConsiderations}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.patientName.trim()}
                  className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Saving..." : editingId ? "Update" : "Add Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Table */}
      {patients.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">
          No patients added yet. Click &quot;Add Patient&quot; to get started.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-blue-800 text-white text-sm">
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Service</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Patient</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">MRN</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Primary Diagnosis</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Clinical Status</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Disposition Considerations</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Strike Action</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => (
                <tr
                  key={patient._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-300 px-3 py-2 text-sm">{patient.service}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-medium">{patient.patientName}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{patient.mrn}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{patient.primaryDiagnosis}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{patient.clinicalStatus}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{patient.dispositionConsiderations}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {patient.strikeAction && (
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStrikeActionColor(patient.strikeAction)}`}>
                        {patient.strikeAction}
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => handleEdit(patient)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
