function Prisoners() {
  const prisoners = [
    { id: "P001", name: "Ruwan Bandara", cell: "C001", status: "Active" },
    { id: "P002", name: "Sunil Weerasinghe", cell: "C001", status: "Released" },
    { id: "P003", name: "Kasun Dias", cell: "C002", status: "Active" },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Prisoners</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add Prisoner
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Cell</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {prisoners.map((p) => (
              <tr key={p.id} className="border-t hover:bg-slate-50">
                <td className="p-4">{p.id}</td>
                <td className="p-4">{p.name}</td>
                <td className="p-4">{p.cell}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Prisoners;