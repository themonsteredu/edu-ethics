import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { JoinPage } from "./pages/JoinPage";
import { StudentRoomPage } from "./pages/StudentRoomPage";
import { TeacherGate } from "./pages/TeacherGate";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/play" element={<StudentRoomPage />} />
        <Route path="/teacher" element={<TeacherGate />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
