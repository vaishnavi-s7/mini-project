import { useState, useRef } from "react";
import { uploadCSV } from "../services/dataService";
import Papa from "papaparse";
import ProtectedWrapper from "../components/common/ProtectedWrapper";
import { toast } from "react-toastify";

export default function UploadCSV() {

  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef(null);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /* handle file selection */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;

      const firstLine = text.split("\n")[0].trim();

      const headers = firstLine.split(",").map(h =>
        h.trim().toLowerCase()
      );

      const expected = ["name", "email", "grade", "section"];

      const isValid =
        JSON.stringify(headers) === JSON.stringify(expected);

      if (!isValid) {
        toast.error("Fields not matching. Check the columns and reupload.");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        setFile(null);
        return;
      }

      // valid file
      setFile(selectedFile);
    };

    reader.readAsText(selectedFile);
  };
  /* upload file to backend */
  const handleUpload = async () => {

    if (!file) {
      toast.warning("Please select a CSV file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {

      const res = await uploadCSV(formData);

      setResult(res.data);
      setShowModal(true);

      //Reset state
      setFile(null);
      setPreviewData([]);

      //RESET FILE INPUT UI 
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {

      console.error(error);

      const message =
        error?.response?.data?.message ||
        "Upload failed. Please check your CSV format.";

      toast.error(message);

    }

  };

  /* preview CSV */
  const handlePreview = () => {

    if (!file) {
      toast.warning("Please select a CSV file first");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {

        const rows = results.data;
        setPreviewData(rows);

      }
    });

  };

  //DOWNLOAD ERROR CSV
  const downloadErrors = (errors) => {
    if (!errors || errors.length === 0) return;

    const rows = errors.map(e => ({
      row: e.row,
      errors: e.errors.join(" | "),
      ...e.data
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      Object.keys(rows[0]).join(",") +
      "\n" +
      rows.map(r => Object.values(r).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "error_report.csv");
    document.body.appendChild(link);

    link.click();
  };
  // DOWNLOAD SAMPLE TEMPLATE
  const downloadTemplate = () => {
    const headers = ["name", "email", "grade", "section"];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") + "\n" +
      "John Doe,john@example.com,5,A";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_template.csv");
    document.body.appendChild(link);

    link.click();
  };
  return (
    <ProtectedWrapper>
      <div className="min-h-[80vh] flex justify-center items-start py-10 px-4 bg-gray-100">

        <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">

          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Upload CSV File
          </h2>

          <p className="text-center text-gray-500 mb-6">
            Upload a CSV file to preview and store student data
          </p>

          {/* Upload Box */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition bg-gray-50">

            <p className="text-gray-600 mb-2 font-medium">
              Drag & Drop your CSV file here
            </p>

            <p className="text-sm text-gray-400 mb-4">or</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
  file:mr-4 file:py-2 file:px-4
  file:rounded-lg file:border-0
  file:text-sm file:font-semibold
  file:bg-blue-100 file:text-blue-700
  hover:file:bg-blue-200"
            />

            {file && (
              <p className="text-sm text-green-600 mt-3 font-medium">
                Selected: {file.name}
              </p>
            )}

          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={downloadTemplate}
              className="bg-blue-400 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition cursor-pointer"
            >
              Download Sample Template
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Disclaimer : Do not modify the header row. Only fill data from row 2 onwards.
          </p>
          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-6">

            <button
              onClick={handleUpload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition cursor-pointer"
            >
              Upload
            </button>

            <button
              onClick={handlePreview}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg shadow transition cursor-pointer"
            >
              Preview
            </button>
          </div>
          <div className="mt-6 bg-gray-50 border rounded-lg p-4 text-sm text-gray-700">
            <h3 className="font-semibold text-lg mb-2">Requirements</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>name</strong> → must be a valid string</li>
              <li><strong>email</strong> → must contain "@", ".", and end with ".com"</li>
              <li><strong>grade</strong> → must be a number between 1 and 10</li>
              <li><strong>section</strong> → must be one of: A, B, C, D</li>
            </ul>
          </div>
          {/* Preview Table */}
          {/* Preview Section */}
          {previewData.length > 0 && (
            <div className="mt-8">

              <h3 className="text-lg sm:text-xl font-semibold mb-4">
                CSV Preview
              </h3>

              {/* DESKTOP / TABLET */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border rounded-lg overflow-hidden min-w-[600px]">
                  <thead className="bg-gray-200 text-sm">
                    <tr>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Grade</th>
                      <th className="p-3 text-left">Section</th>
                    </tr>
                  </thead>

                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50 text-sm">
                        <td className="p-3">{row.name}</td>
                        <td className="p-3 break-all">{row.email}</td>
                        <td className="p-3">{row.grade}</td>
                        <td className="p-3">{row.section}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE VIEW */}
              <div className="md:hidden space-y-3">
                {previewData.map((row, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 shadow-sm bg-white"
                  >
                    <p className="font-semibold text-gray-800">
                      {row.name || "—"}
                    </p>

                    <p className="text-sm text-gray-500 break-all">
                      {row.email || "—"}
                    </p>

                    <div className="flex justify-between mt-2 text-sm">
                      <span>Grade: {row.grade || "-"}</span>
                      <span>Section: {row.section || "-"}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* MODAL FIXED */}
        {showModal && result && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">

            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">

              <h2 className="text-xl font-bold mb-4 text-center">
                Upload Summary
              </h2>

              <div className="flex justify-around text-sm mb-4">
                <span className="text-green-600 font-semibold">Inserted: {result.inserted}</span>
                <span className="text-yellow-600 font-semibold">Duplicates: {result.duplicates}</span>
                <span className="text-red-600 font-semibold">Errors: {result.errors?.length || 0}</span>
              </div>

              {result.errors?.length > 0 && (
                <div className="overflow-x-auto">

                  <table className="w-full text-sm border">

                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 border">Row</th>
                        <th className="p-2 border">Errors</th>
                      </tr>
                    </thead>

                    <tbody>
                      {result.errors.map((err, index) => (
                        <tr key={index}>
                          <td className="border p-2 text-center">{err.row}</td>
                          <td className="border p-2">{err.errors.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>

                  </table>

                </div>
              )}

              <div className="flex justify-between mt-6">

                <button
                  onClick={() => downloadErrors(result.errors)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                >
                  Download Errors
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-400 px-4 py-2 rounded-lg text-white cursor-pointer"
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </ProtectedWrapper>
  );
}