// ดึง URL จาก Environment Variable เพื่อความปลอดภัย
const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL;

export const saveExercise = async (data) => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error("Error saving exercise:", error);
    return { status: "error", message: error.message };
  }
};

export const getExercises = async () => {
  try {
    const response = await fetch(SCRIPT_URL);
    return await response.json();
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return { status: "error", message: error.message };
  }
};

export const deleteExercise = async (title, date, folderId) => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "delete", title, date, folderId: folderId || null }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return { status: "error", message: error.message };
  }
};