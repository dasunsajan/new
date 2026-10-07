import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import DashboardHome from "../components/DashboardHome";

const authCfg = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

const COMMON = [
  { name: "photo", labelKey: "fieldPhoto", type: "photo", detail: true },
  { name: "fullName", labelKey: "fieldFullName", required: true },
  { name: "nic", labelKey: "fieldNic" },
  { name: "phone", labelKey: "fieldPhone" },
  { name: "dateOfBirth", labelKey: "fieldDob", type: "date" },
  { name: "address", labelKey: "fieldAddress" },
];

const EMERGENCY = [
  { name: "emergencyContactName", labelKey: "fieldEmergencyName" },
  { name: "emergencyContactNic", labelKey: "fieldEmergencyNic" },
  { name: "emergencyContactPhone", labelKey: "fieldEmergencyPhone" },
  { name: "emergencyContactAddress", labelKey: "fieldEmergencyAddress" },
];

const TYPES = {
  prisoner: { labelKey: "tabPrisoners", fields: [
    { name: "caseNumber", labelKey: "fieldCaseNumber", required: true },
    { name: "cellNumber", labelKey: "fieldCellNumber" },
    { name: "offence", labelKey: "fieldOffence" },
    { name: "offenceSi", labelKey: "fieldOffenceSi" },
    { name: "offenceTa", labelKey: "fieldOffenceTa" },
    { name: "admissionDate", labelKey: "fieldAdmissionDate", type: "date" },
    { name: "sentenceYears", labelKey: "fieldSentenceYears", type: "number" },
    { name: "guardianName", labelKey: "fieldGuardianName" },
    { name: "guardianNic", labelKey: "fieldGuardianNic" },
    { name: "guardianPhone", labelKey: "fieldGuardianPhone" },
    { name: "guardianAddress", labelKey: "fieldGuardianAddress" },
  ]},
  doctor: { labelKey: "tabDoctors", fields: [
    { name: "licenseNumber", labelKey: "fieldLicenseNumber", required: true },
    { name: "specialization", labelKey: "fieldSpecialization" },
    ...EMERGENCY,
  ]},
  visitor: { labelKey: "tabVisitors", fields: [
    { name: "visitingPrisoner", labelKey: "fieldVisitingPrisoner" },
    { name: "relationship", labelKey: "fieldRelationship" },
    { name: "visitDate", labelKey: "fieldVisitDate", type: "date" },
    { name: "purpose", labelKey: "fieldPurpose" },
    ...EMERGENCY,
  ]},
  officer: { labelKey: "tabOfficers", fields: [
    { name: "badgeNumber", labelKey: "fieldBadgeNumber", required: true },
    { name: "rank", labelKey: "fieldRank" },
    { name: "department", labelKey: "fieldDepartment" },
    ...EMERGENCY,
  ]},
  staff: { labelKey: "tabStaff", fields: [
    { name: "department", labelKey: "fieldDepartment" },
    { name: "jobTitle", labelKey: "fieldJobTitle" },
    ...EMERGENCY,
  ]},
};

const inputClass =
  "w-full border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

// image eka podi karanawa (max 300px) - request size error enne na
const resizeImage = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 300 / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

function Dashboard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t } = useLanguage();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const tab = TYPES[params.get("type")] ? params.get("type") : null;

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [invite, setInvite] = useState({ badgeNumber: "", fullName: "" });
  const [inviteCode, setInviteCode] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }, [navigate]);

  const load = useCallback(async () => {
    if (!tab) return;
    try {
      const res = await api.get(`/people/${tab}`, { ...authCfg(), params: { q: search } });
      setRows(res.data);
    } catch (err) {
      if ([401, 403].includes(err.response?.status)) logout();
      else setError(t("loadFailed"));
    }
  }, [tab, search, logout, t]);

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/");
    else load();
  }, [load, navigate]);

  // sidebar eken category wenas karaddi reset karanawa
  useEffect(() => {
    setSearch("");
    setForm(null);
    setError("");
    setRows([]);
  }, [tab]);

  const openNew = () => {
    setError("");
    setForm({ fullName: "", nic: "", phone: "", dateOfBirth: "", address: "", details: {} });
  };

  const openEdit = (row) => {
    setError("");
    setForm({ ...row, dateOfBirth: row.dateOfBirth ? row.dateOfBirth.slice(0, 10) : "", details: { ...row.details } });
  };

  const translateOffence = async () => {
    const text = form.details?.offence;
    if (!text?.trim()) return;
    try {
      const si = await api.post("/translate", { text, targetLang: "si" }, authCfg());
      const ta = await api.post("/translate", { text, targetLang: "ta" }, authCfg());
      setForm({
        ...form,
        details: { ...form.details, offenceSi: si.data.translatedText, offenceTa: ta.data.translatedText },
      });
    } catch (err) {
      console.error(err);
      alert(t("translationFailed"));
    }
  };

  const value = (f) => (f.detail ? form.details?.[f.name] : form[f.name]) ?? "";
  const change = (f, v) =>
    f.detail ? setForm({ ...form, details: { ...form.details, [f.name]: v } }) : setForm({ ...form, [f.name]: v });

  const cell = (r, f) => (f.detail ? r.details?.[f.name] : r[f.name]) ?? "";

  const save = async (e) => {
    e.preventDefault();
    setError("");
    const { fullName, nic, phone, address, dateOfBirth, details } = form;
    const payload = { fullName, nic, phone, address, dateOfBirth, details };
    try {
      if (form._id) await api.put(`/people/${tab}/${form._id}`, payload, authCfg());
      else await api.post(`/people/${tab}`, payload, authCfg());
      setForm(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || t("saveFailed"));
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`${t("deleteConfirm")} ${row.fullName}${t("deleteConfirmSuffix")}`)) return;
    try {
      await api.delete(`/people/${tab}/${row._id}`, authCfg());
      load();
    } catch (err) {
      setError(err.response?.data?.message || t("deleteFailed"));
    }
  };

  const createInvite = async (e) => {
    e.preventDefault();
    setInviteCode("");
    try {
      const res = await api.post("/admin/invites", invite, authCfg());
      setInviteCode(res.data.code);
      setInvite({ badgeNumber: "", fullName: "" });
    } catch (err) {
      setError(err.response?.data?.message || t("inviteFailed"));
    }
  };

  const typeInfo = tab ? TYPES[tab] : null;
  const allFields = typeInfo
    ? [...COMMON, ...typeInfo.fields.map((f) => ({ ...f, detail: true }))]
    : [];

  const renderCell = (r, f) => {
    const v = cell(r, f);
    if (f.type === "photo")
      return v ? (
        <img src={v} alt="" className="w-12 h-14 object-cover rounded border" />
      ) : (
        <div className="w-12 h-14 bg-slate-200 rounded flex items-center justify-center">👤</div>
      );
    if (f.type === "date") return String(v).slice(0, 10);
    return String(v);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold">{t("dashboardTitle")}</h1>
        <div className="text-sm flex items-center gap-4">
          <span>{user?.fullName} ({user?.role})</span>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">{t("logout")}</button>
        </div>
      </header>

      <main className="p-6">
        {/* Dashboard home: overview + invite form */}
        {!tab && (
          <>
            <DashboardHome />

            {user?.role === "admin" && (
              <form onSubmit={createInvite} className="bg-white p-4 rounded-xl shadow mb-6">
                <h2 className="font-semibold text-slate-700 mb-2">{t("inviteSectionTitle")}</h2>
                <div className="flex flex-wrap gap-2">
                  <input placeholder={t("officerFullName")} required value={invite.fullName}
                    onChange={(e) => setInvite({ ...invite, fullName: e.target.value })} className={inputClass + " md:w-64"} />
                  <input placeholder={t("badgeNumberPlaceholder")} required value={invite.badgeNumber}
                    onChange={(e) => setInvite({ ...invite, badgeNumber: e.target.value })} className={inputClass + " md:w-48"} />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg">{t("generate")}</button>
                </div>
                {inviteCode && (
                  <p className="mt-3 text-sm">
                    {t("inviteCodeLabel")}: <span className="font-mono font-bold text-lg">{inviteCode}</span>{" "}
                    <span className="text-slate-500">{t("inviteCodeNote")}</span>
                  </p>
                )}
              </form>
            )}
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          </>
        )}

        {/* Category view */}
        {tab && (
          <>
            <h2 className="text-xl font-bold text-slate-800 mb-4">{t(typeInfo.labelKey)}</h2>

            <div className="flex gap-2 mb-4">
              <input placeholder={t("searchPlaceholder")} value={search}
                onChange={(e) => setSearch(e.target.value)} className={inputClass} />
              <button onClick={openNew} className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-lg whitespace-nowrap">
                {t("addButton")}
              </button>
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            {form && (
              <form onSubmit={save} className="bg-white p-4 rounded-xl shadow mb-4">
                <h2 className="font-semibold text-slate-700 mb-3">
                  {form._id ? t("editPrefix") : t("addPrefix")} · {t(typeInfo.labelKey)}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {allFields.map((f) => (
                    <div key={f.name}>
                      <label className="block text-sm text-slate-600 mb-1">{t(f.labelKey)}</label>
                      {f.type === "photo" ? (
                        <div>
                          <input type="file" accept="image/*" className={inputClass}
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) change(f, await resizeImage(file));
                            }} />
                          {value(f) && <img src={value(f)} alt="" className="w-24 h-28 object-cover mt-2 rounded border" />}
                        </div>
                      ) : (
                        <input type={f.type || "text"} value={value(f)} required={f.required}
                          onChange={(e) => change(f, e.target.value)} className={inputClass} />
                      )}
                    </div>
                  ))}
                </div>
                {tab === "prisoner" && (
                  <button type="button" onClick={translateOffence}
                    className="mt-2 text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded-lg">
                    {t("translateOffenceBtn")}
                  </button>
                )}
                <div className="mt-4 flex gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">{t("saveBtn")}</button>
                  <button type="button" onClick={() => setForm(null)} className="bg-slate-200 px-4 py-2 rounded-lg">{t("cancelBtn")}</button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    {allFields.map((f) => (
                      <th key={f.name} className="p-3 whitespace-nowrap">{t(f.labelKey)}</th>
                    ))}
                    <th className="p-3">{t("actionsCol")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={allFields.length + 1} className="p-4 text-center text-slate-400">{t("noRecords")}</td></tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r._id} className="border-t">
                      {allFields.map((f) => (
                        <td key={f.name} className="p-3 whitespace-nowrap">{renderCell(r, f)}</td>
                      ))}
                      <td className="p-3 whitespace-nowrap">
                        <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline mr-3">{t("editAction")}</button>
                        <button onClick={() => remove(r)} className="text-red-600 hover:underline">{t("deleteAction")}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;