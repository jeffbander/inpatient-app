"use client";

import { ProgressNote, Patient, calculateAge, formatDate } from "@/types/progressNote";

interface ProgressNoteDisplayProps {
  note: ProgressNote;
  patient: Patient;
  onCopy?: () => void;
  onSave?: () => void;
}

export function ProgressNoteDisplay({ note, patient, onCopy, onSave }: ProgressNoteDisplayProps) {
  const age = calculateAge(patient.dateOfBirth);

  const handleCopy = async () => {
    const noteText = document.getElementById("progress-note-content")?.innerText || "";
    await navigator.clipboard.writeText(noteText);
    onCopy?.();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with actions */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Generated Note</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Copy
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Note content */}
      <div id="progress-note-content" className="p-6 font-mono text-sm leading-relaxed">
        {/* Note Header / Title */}
        <div className="text-center mb-6">
          <h3 className="text-base font-bold uppercase tracking-wide">
            {note.noteType}
          </h3>
        </div>

        {/* Encounter Info */}
        <div className="mb-6">
          <p><span className="font-semibold">Date:</span> {formatDate(note.encounterDate)}</p>
          <p><span className="font-semibold">Patient Name:</span> {patient.firstName} {patient.lastName}</p>
          <p><span className="font-semibold">DOB:</span> {formatDate(patient.dateOfBirth)}</p>
          <p><span className="font-semibold">MRN:</span> {patient.mrn}</p>
        </div>

        {/* Contact and Demographics - Side by side layout */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p><span className="font-semibold">Contact Information:</span></p>
            {patient.phone && <p>Telephone: {patient.phone}</p>}
            {patient.primaryCareProvider && <p>PCP: {patient.primaryCareProvider}</p>}
          </div>
          <div className="text-right">
            <p>Age: {age} y.o.</p>
            <p>Gender: {patient.gender}</p>
          </div>
        </div>

        {/* Provider Info */}
        {note.referringProvider && (
          <p className="mb-2"><span className="font-semibold">Referring Physician:</span> {note.referringProvider}</p>
        )}
        {note.cardiologist && (
          <p className="mb-2"><span className="font-semibold">Cardiologist:</span> {note.cardiologist}</p>
        )}

        <hr className="my-6 border-gray-300" />

        {/* History of Present Illness */}
        <section className="mb-6">
          <h4 className="font-bold mb-2">History of Present Illness:</h4>
          <p className="whitespace-pre-wrap">{note.historyOfPresentIllness}</p>
        </section>

        {/* Past Medical History */}
        {note.pastMedicalHistory && note.pastMedicalHistory.length > 0 && (
          <section className="mb-6">
            <h4 className="font-bold mb-2">Past Medical History:</h4>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-1">Diagnosis</th>
                  <th className="pb-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {note.pastMedicalHistory.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-0.5">• {item.diagnosis}</td>
                    <td className="py-0.5">{item.date || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {note.pastMedicalHistory.some(item => item.notes) && (
              <div className="mt-2 ml-4 text-gray-600">
                {note.pastMedicalHistory.filter(item => item.notes).map((item, idx) => (
                  <p key={idx}>{item.notes}</p>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Past Surgical History */}
        {note.pastSurgicalHistory && note.pastSurgicalHistory.length > 0 && (
          <section className="mb-6">
            <h4 className="font-bold mb-2">Past Surgical History:</h4>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-1">Procedure</th>
                  <th className="pb-1">Laterality</th>
                  <th className="pb-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {note.pastSurgicalHistory.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-0.5">• {item.procedure}</td>
                    <td className="py-0.5">{item.laterality || ""}</td>
                    <td className="py-0.5">{item.date || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {note.pastSurgicalHistory.some(item => item.notes) && (
              <div className="mt-2 ml-4 text-gray-600">
                {note.pastSurgicalHistory.filter(item => item.notes).map((item, idx) => (
                  <p key={idx}>{item.notes}</p>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Family History */}
        {note.familyHistory && note.familyHistory.length > 0 && (
          <section className="mb-6">
            <h4 className="font-bold mb-2">Family History:</h4>
            {note.familyHistory.map((item, idx) => (
              <p key={idx}>
                {item.relation} {item.condition}
                {item.ageAtOnset && ` [${item.ageAtOnset}]`}
                {item.notes && ` - ${item.notes}`}
              </p>
            ))}
          </section>
        )}

        {/* Social History */}
        {note.socialHistory && (
          <section className="mb-6">
            <h4 className="font-bold mb-2">Social History:</h4>
            {note.socialHistory.tobacco && <p><span className="font-medium">Tobacco:</span> {note.socialHistory.tobacco}</p>}
            {note.socialHistory.alcohol && <p><span className="font-medium">EtOH:</span> {note.socialHistory.alcohol}</p>}
            {note.socialHistory.drugs && <p><span className="font-medium">Drugs:</span> {note.socialHistory.drugs}</p>}
            {note.socialHistory.occupation && <p><span className="font-medium">Occupation:</span> {note.socialHistory.occupation}</p>}
            {note.socialHistory.supportSystem && <p><span className="font-medium">Support system:</span> {note.socialHistory.supportSystem}</p>}
            {note.socialHistory.other && <p>{note.socialHistory.other}</p>}
          </section>
        )}

        {/* Allergies */}
        <section className="mb-6">
          <h4 className="font-bold mb-2">Allergies:</h4>
          {note.allergies && note.allergies.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-1">Allergen</th>
                  <th className="pb-1">Reactions</th>
                </tr>
              </thead>
              <tbody>
                {note.allergies.map((allergy, idx) => (
                  <tr key={idx}>
                    <td className="py-0.5">• {allergy.allergen}</td>
                    <td className="py-0.5">{allergy.reaction || "Unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Patient has no known allergies.</p>
          )}
        </section>

        {/* Current Medications */}
        <section className="mb-6">
          <h4 className="font-bold mb-2">Current Medications:</h4>
          {note.currentMedications && note.currentMedications.length > 0 ? (
            <ul>
              {note.currentMedications.map((med, idx) => (
                <li key={idx}>
                  • {med.name}
                  {med.dose && ` ${med.dose}`}
                  {med.frequency && ` ${med.frequency}`}
                </li>
              ))}
            </ul>
          ) : (
            <p>No current outpatient medications on file.</p>
          )}
        </section>

        <hr className="my-6 border-gray-300" />

        {/* Review of Systems */}
        {note.reviewOfSystems && (
          <section className="mb-6">
            <h4 className="font-bold mb-2">Review of Systems:</h4>
            {note.reviewOfSystems.general && <p>{note.reviewOfSystems.general}</p>}
            {Object.entries(note.reviewOfSystems).filter(([key, value]) => key !== 'general' && value).length === 0 ? (
              <p>ROS: Reviewed and comprehensively negative, except as indicated in HPI</p>
            ) : (
              <div>
                {note.reviewOfSystems.constitutional && <p><span className="font-medium">Constitutional:</span> {note.reviewOfSystems.constitutional}</p>}
                {note.reviewOfSystems.cardiovascular && <p><span className="font-medium">Cardiovascular:</span> {note.reviewOfSystems.cardiovascular}</p>}
                {note.reviewOfSystems.respiratory && <p><span className="font-medium">Respiratory:</span> {note.reviewOfSystems.respiratory}</p>}
                {note.reviewOfSystems.gastrointestinal && <p><span className="font-medium">Gastrointestinal:</span> {note.reviewOfSystems.gastrointestinal}</p>}
                {note.reviewOfSystems.genitourinary && <p><span className="font-medium">Genitourinary:</span> {note.reviewOfSystems.genitourinary}</p>}
                {note.reviewOfSystems.musculoskeletal && <p><span className="font-medium">Musculoskeletal:</span> {note.reviewOfSystems.musculoskeletal}</p>}
                {note.reviewOfSystems.skin && <p><span className="font-medium">Skin:</span> {note.reviewOfSystems.skin}</p>}
                {note.reviewOfSystems.neurologic && <p><span className="font-medium">Neurologic:</span> {note.reviewOfSystems.neurologic}</p>}
                {note.reviewOfSystems.psychiatric && <p><span className="font-medium">Psychiatric:</span> {note.reviewOfSystems.psychiatric}</p>}
                {note.reviewOfSystems.endocrine && <p><span className="font-medium">Endocrine:</span> {note.reviewOfSystems.endocrine}</p>}
                {note.reviewOfSystems.hematologic && <p><span className="font-medium">Hematologic:</span> {note.reviewOfSystems.hematologic}</p>}
                {note.reviewOfSystems.allergicImmunologic && <p><span className="font-medium">Allergic/Immunologic:</span> {note.reviewOfSystems.allergicImmunologic}</p>}
              </div>
            )}
          </section>
        )}

        {/* Physical Exam */}
        <section className="mb-6">
          <h4 className="font-bold mb-2">Physical Exam:</h4>

          {/* Vitals */}
          {note.physicalExam.vitals && (
            <div className="mb-4">
              <p className="text-gray-600">
                {note.physicalExam.vitals.bloodPressure && (
                  <>BP {note.physicalExam.vitals.bloodPressure}
                    {note.physicalExam.vitals.bloodPressureLocation && ` (BP Location: ${note.physicalExam.vitals.bloodPressureLocation}`}
                    {note.physicalExam.vitals.bloodPressurePosition && `, Patient Position: ${note.physicalExam.vitals.bloodPressurePosition})`}
                    {!note.physicalExam.vitals.bloodPressureLocation && !note.physicalExam.vitals.bloodPressurePosition && ""}
                    {" | "}
                  </>
                )}
                {note.physicalExam.vitals.heartRate && <>Pulse {note.physicalExam.vitals.heartRate} | </>}
                {note.physicalExam.vitals.height && <>Ht {note.physicalExam.vitals.height} | </>}
                {note.physicalExam.vitals.weight && <>Wt {note.physicalExam.vitals.weight} | </>}
                {note.physicalExam.vitals.bmi && <>BMI {note.physicalExam.vitals.bmi}</>}
              </p>
            </div>
          )}

          {/* Exam findings */}
          {note.physicalExam.constitutional && (
            <p><span className="font-medium">Constitutional:</span> {note.physicalExam.constitutional}</p>
          )}
          {note.physicalExam.eyes && (
            <p><span className="font-medium">Eyes:</span> {note.physicalExam.eyes}</p>
          )}
          {note.physicalExam.enmt && (
            <p><span className="font-medium">ENMT:</span> {note.physicalExam.enmt}</p>
          )}
          {note.physicalExam.neck && (
            <p><span className="font-medium">Neck:</span> {note.physicalExam.neck}</p>
          )}
          {note.physicalExam.cardiovascular && (
            <p><span className="font-medium">Cardiovascular:</span> {note.physicalExam.cardiovascular}</p>
          )}
          {note.physicalExam.respiratory && (
            <p><span className="font-medium">Respiratory:</span> {note.physicalExam.respiratory}</p>
          )}
          {note.physicalExam.gastrointestinal && (
            <p><span className="font-medium">Gastrointestinal:</span> {note.physicalExam.gastrointestinal}</p>
          )}
          {note.physicalExam.extremities && (
            <p><span className="font-medium">Extremities:</span> {note.physicalExam.extremities}</p>
          )}
          {note.physicalExam.skin && (
            <p><span className="font-medium">Skin:</span> {note.physicalExam.skin}</p>
          )}
          {note.physicalExam.neurologic && (
            <p><span className="font-medium">Neurologic:</span> {note.physicalExam.neurologic}</p>
          )}
          {note.physicalExam.psychiatric && (
            <p><span className="font-medium">Psych:</span> {note.physicalExam.psychiatric}</p>
          )}
        </section>

        <hr className="my-6 border-gray-300" />

        {/* Diagnostics */}
        {note.diagnostics && (
          <section className="mb-6">
            <h4 className="font-bold mb-2">Diagnostics:</h4>

            {/* Labs */}
            {note.diagnostics.labs && note.diagnostics.labs.length > 0 && (
              <div className="mb-4">
                <p className="font-medium">Relevant Labs:</p>
                {note.diagnostics.labs.map((lab, idx) => (
                  <p key={idx}>{lab.date} - {lab.results}</p>
                ))}
              </div>
            )}

            {/* EKG */}
            {note.diagnostics.ekg && note.diagnostics.ekg.length > 0 && (
              <div className="mb-4">
                {note.diagnostics.ekg.map((ekg, idx) => (
                  <p key={idx}>EKG ({ekg.date}): {ekg.findings}</p>
                ))}
              </div>
            )}

            {/* Imaging */}
            {note.diagnostics.imaging && note.diagnostics.imaging.length > 0 && (
              <div className="mb-4">
                {note.diagnostics.imaging.map((img, idx) => (
                  <p key={idx}>{img.type} ({img.date}): {img.findings}</p>
                ))}
              </div>
            )}

            {/* Other */}
            {note.diagnostics.other && note.diagnostics.other.length > 0 && (
              <div className="mb-4">
                {note.diagnostics.other.map((item, idx) => (
                  <p key={idx}>{item.type} ({item.date}): {item.findings}</p>
                ))}
              </div>
            )}
          </section>
        )}

        <hr className="my-6 border-gray-300" />

        {/* Assessment and Plan */}
        <section className="mb-6">
          <h4 className="font-bold mb-2">Assessment and Plan:</h4>

          <div className="mb-4">
            <p className="font-medium">Assessment:</p>
            <p className="whitespace-pre-wrap">{note.assessment}</p>
          </div>

          {note.plan.map((planItem, idx) => (
            <div key={idx} className="mb-4">
              {planItem.problem && (
                <p className="font-medium">Regarding {planItem.problem}:</p>
              )}
              <p className="whitespace-pre-wrap">{planItem.details}</p>
            </div>
          ))}

          <p className="mt-4">Patient counseled on acute issues and verbalized understanding.</p>
        </section>

        {/* Orders and Diagnoses */}
        {(note.ordersPlaced && note.ordersPlaced.length > 0) && (
          <section className="mb-6">
            <h4 className="font-bold mb-2">Orders Placed:</h4>
            <ul>
              {note.ordersPlaced.map((order, idx) => (
                <li key={idx}>{order}</li>
              ))}
            </ul>
          </section>
        )}

        {(note.medicationChanges && note.medicationChanges.length > 0) && (
          <section className="mb-6">
            <h4 className="font-bold mb-2">Medication Changes:</h4>
            <ul>
              {note.medicationChanges.map((change, idx) => (
                <li key={idx}>{change}</li>
              ))}
            </ul>
          </section>
        )}

        {(note.visitDiagnoses && note.visitDiagnoses.length > 0) && (
          <section className="mb-6">
            <h4 className="font-bold mb-2">Visit Diagnoses:</h4>
            <ul>
              {note.visitDiagnoses.map((dx, idx) => (
                <li key={idx}>{dx}</li>
              ))}
            </ul>
          </section>
        )}

        <hr className="my-6 border-gray-300" />

        {/* Attestation */}
        {note.attestation && (
          <section className="mb-6">
            {note.scribe && note.attestation.scribeAttestation && (
              <div className="mb-4">
                <p className="font-medium">Scribe Attestation:</p>
                <p>{note.attestation.scribeAttestation.text}</p>
                <p>Electronically signed: {note.attestation.scribeAttestation.signedBy} {note.attestation.scribeAttestation.signedAt}</p>
              </div>
            )}

            {note.attestation.providerAttestation && (
              <div className="mb-4">
                <p className="font-medium">Provider Attestation:</p>
                <p>{note.attestation.providerAttestation.text}</p>
                <p>{note.attestation.providerAttestation.signedAt}</p>
              </div>
            )}

            {note.attestation.cosignedBy && (
              <div className="mt-4">
                <p><span className="font-medium">Cosigned by:</span> {note.attestation.cosignedBy.name} at {note.attestation.cosignedBy.signedAt}</p>
              </div>
            )}
          </section>
        )}

        {/* Provider signature block */}
        <section className="mt-8">
          <p className="font-semibold">{note.provider.name}, {note.provider.title}</p>
          <p>{note.provider.specialty}</p>
          {note.provider.contactInfo && (
            <div className="text-sm text-gray-600 mt-2">
              {note.provider.contactInfo.phone && <p>Tel: {note.provider.contactInfo.phone}</p>}
              {note.provider.contactInfo.fax && <p>Fax: {note.provider.contactInfo.fax}</p>}
              {note.provider.contactInfo.email && <p>Email: {note.provider.contactInfo.email}</p>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
