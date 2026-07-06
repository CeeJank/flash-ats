

const attendanceURL = "https://myats.sp.edu.sg/psc/csprdatstd/EMPLOYEE/SA/s/WEBLIB_A_ATS.ISCRIPT1.FieldFormula.IScript_SubmitAttendance"

// send a post request to the attendance URL
export async function sendPin(pin: string) {
  try {
    const request = await fetch(attendanceURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pin
      }),
    })
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to send pin: ${error}`)

  }
}
