"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/api";

export default function Chatbot() {
  const [activeTab, setActiveTab] = useState("chat"); // Active tab in the sidebar
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [sessions, setSessions] = useState({});
  const [currentSessionId, setCurrentSessionId] = useState("default_session");
  const router = useRouter();

  // Check if the user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      fetchUploadedFiles();
      fetchSessions();
    }
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const response = await api.get("/get_uploaded_files");
      setUploadedFiles(response.data.uploaded_files);
    } catch (error) {
      console.error("Failed to fetch uploaded files:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await api.get("/gethistory");
      setSessions(
        response.data.history.reduce((acc, session) => {
          acc[session.session_id] = session.messages;
          return acc;
        }, {})
      );
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      setSessions({}); // Fallback to empty object
    }
  };

  const createNewSession = () => {
    const newSessionId = `session_${Date.now()}`; // Create a unique session ID
    setSessions((prev) => ({ ...prev, [newSessionId]: [] }));
    setCurrentSessionId(newSessionId); // Set the new session as active
    alert(`New session created: ${newSessionId}`);
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await api.post("/upload_files", formData);
      const uploadedFileNames = response.data.uploaded_files;
      setUploadedFiles((prev) => [...prev, ...uploadedFileNames]);
      alert("Files uploaded successfully!");
    } catch (error) {
      alert("Failed to upload files. Please try again.");
      console.error(error);
    }
  };

  const handleFileDelete = async (fileName) => {
    try {
      const response = await api.delete(`/delete_file`, {
        params: { file_id: fileName },
      });
      alert(response.data.message);
      // Refresh the document list after deletion
      fetchUploadedFiles();
    } catch (error) {
      alert("Failed to delete the file. Please try again.");
      console.error(error);
    }
  };

  const handleAskQuestion = async () => {
    try {
      const response = await api.post("/ask_question", {
        question,
        session_id: currentSessionId,
      });
      setAnswer(response.data.answer);
      setSessions((prev) => ({
        ...prev,
        [currentSessionId]: [
          ...(prev[currentSessionId] || []),
          { question, answer: response.data.answer },
        ],
      }));
    } catch (err) {
      alert("Failed to fetch answer. Please try again.");
    }
  };

  useEffect(() => {
    // Set default session if no current session is selected
    if (Object.keys(sessions).length > 0 && !sessions[currentSessionId]) {
      setCurrentSessionId(Object.keys(sessions)[0]); // Default to the first session
    }
  }, [sessions]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 space-y-4">
        <h2 className="text-lg font-bold mb-4">Options</h2>
        <button
          className={`block w-full text-left px-4 py-2 rounded ${
            activeTab === "chat" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          Histories & Sessions
        </button>
        <button
          className={`block w-full text-left px-4 py-2 rounded ${
            activeTab === "upload" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("upload")}
        >
          Upload Files
        </button>
        <button
          className={`block w-full text-left px-4 py-2 rounded ${
            activeTab === "documents" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("documents")}
        >
          Documents List
        </button>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6">
        {activeTab === "chat" && (
          <>
            <h2 className="text-xl font-semibold mb-4">Chatbot</h2>
            <div className="mb-4 flex items-center gap-4">
              <label className="block text-sm font-medium">Session ID:</label>
              <select
                value={currentSessionId}
                onChange={(e) => setCurrentSessionId(e.target.value)}
                className="w-[250px] px-4 py-2 border rounded-md"
              >
                {Object.keys(sessions ?? {}).map((sessionId) => (
                  <option key={sessionId} value={sessionId}>
                    {sessionId}
                  </option>
                ))}
              </select>
              <button
                onClick={createNewSession}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                + New Session
              </button>
            </div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="w-full h-32 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            ></textarea>
            <button
              onClick={handleAskQuestion}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 mt-4"
            >
              Ask
            </button>
            {answer && (
              <div className="mt-6 bg-gray-100 p-4 rounded-md">
                <h3 className="text-lg font-semibold">Answer:</h3>
                <p className="mt-2">{answer}</p>
              </div>
            )}
            {sessions[currentSessionId]?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Chat History</h3>
                <ul className="space-y-2">
                  {sessions[currentSessionId].map((chat, index) => (
                    <li key={index} className="bg-gray-100 p-4 rounded-md">
                      <p className="font-semibold">Q: {chat.question}</p>
                      <p className="mt-2">A: {chat.answer}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {activeTab === "upload" && (
          <>
            <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={handleFileUpload}
              className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 mt-4"
            >
              Upload Files
            </button>
          </>
        )}

        {activeTab === "documents" && (
          <>
            <h2 className="text-xl font-semibold mb-4">Documents List</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-4">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="flex items-center gap-10">
                  <span>{file}</span>
                  <button
                    onClick={() => handleFileDelete(file)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
