import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getPhoto, savePhoto, resizeImage } from "../utils/profile";

function Info({ label, value }) {
  if (!value) return null;
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{label}</div>
      <div className="font-medium text-slate-800 break-words">{value}</div>
    </div>
  );
}

export default function Profile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileRef = useRef();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [photo, setPhoto] = useState(getPhoto(user));

  useEffect(() => {
    if (!user) navigate("/");
  }, []);

  const onPick = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await resizeImage(file);
    savePhoto(user, data);
    setPhoto(data);
  };

  const remove = () => {
    savePhoto(user, "");
    setPhoto("");
  };

  if (!user) return null;

  return (
    <div className="p-6 max-w-4xl">
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {/* Banner */}
        <div className="h-36 bg-gradient-to-r from-slate-900 via-blue-900 to-blue-600" />

        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="-mt-16 flex items-end justify-between flex-wrap gap-4">
            <div className="relative">
              {photo ? (
                <img src={photo} alt="" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-600 text-white text-5xl font-bold flex items-center justify-center border-4 border-white shadow-lg">
                  {(user.fullName || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileRef.current.click()}
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow flex items-center justify-center"
                title={t("changePhoto")}
              >
                📷
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => fileRef.current.click()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                {t("changePhoto")}
              </button>
              {photo && (
                <button onClick={remove} className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm">
                  {t("removePhoto")}
                </button>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-slate-800">{user.fullName}</h1>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium capitalize">
              {user.role}
            </span>
          </div>

          {/* Details */}
          <h2 className="mt-8 mb-3 font-semibold text-slate-700">{t("profileDetails")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Info label={t("fieldFullName")} value={user.fullName} />
            <Info label={t("username")} value={user.username} />
            <Info label={t("profileRole")} value={user.role} />
            <Info label={t("fieldBadgeNumber")} value={user.badgeNumber} />
            <Info label={t("fieldNic")} value={user.nic} />
            <Info label={t("fieldPhone")} value={user.phone} />
            <Info label="Email" value={user.email} />
            <Info label={t("fieldDepartment")} value={user.department} />
            <Info label={t("fieldRank")} value={user.rank} />
          </div>
        </div>
      </div>
    </div>
  );
}