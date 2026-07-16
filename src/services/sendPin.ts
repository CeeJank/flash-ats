const attendanceURL =
  "https://myats.sp.edu.sg/psc/csprdatstd/EMPLOYEE/SA/s/WEBLIB_A_ATS.ISCRIPT1.FieldFormula.IScript_SubmitAttendance";

// send a post request to the attendance URL
export async function sendPin(pin: string) {
  try {
    if (!/^\d{6}$/.test(pin)) {
      throw new Error("PIN must contain exactly six digits");
    }

    const response = await fetch(attendanceURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin }),
    });

    if (!response.ok) {
      throw new Error(`Attendance endpoint returned ${response.status}`);
    }
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to send pin: ${String(error)}`);
  }
}
