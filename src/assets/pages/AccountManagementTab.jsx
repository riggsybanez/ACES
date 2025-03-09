import { useState } from "react";

export default function AccountManagementTab() {
  const [id, setId] = useState("1234567891011");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="p-10 bg-white shadow-lg rounded-2xl max-w-3xl mx-auto border border-gray-200">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">Edit Account Information</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className="mt-2 p-3 w-full border rounded-xl shadow-inner focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">ID</label>
          <input
            type="text"
            value={id}
            disabled
            className="mt-2 p-3 w-full border rounded-xl bg-gray-200 text-gray-500 shadow-inner cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-2 p-3 w-full border rounded-xl shadow-inner focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-2 p-3 w-full border rounded-xl shadow-inner focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
        </div>

        <button className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all duration-300 shadow-lg">
          Confirm Changes
        </button>
      </div>
    </div>
  );
}
