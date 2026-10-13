import * as ort from 'onnxruntime-react-native';


const InferenceSession = ort.InferenceSession;
const Tensor = ort.Tensor;

// make sure only 1 model is loaded
let session: ort.InferenceSession | null = null;
// Use promise to resolve
async function getSession(): Promise<ort.InferenceSession> {
  if (!session) {
    // load model if null
    session = await InferenceSession.create('./mnist-12.onnx');
   }
  return session;
}

// make sure only 1 session is active at the same time
let sessionActive: Promise<void> | null = null;
async function startInference(): Promise<void> {
  if (sessionActive) {
    // if session is already active
    console.log("session already active, skipping");
    return sessionActive;
  }

  sessionActive = inference().finally(() => {
    sessionActive = null;
  });
  return sessionActive;

}


export async function inference():Promise<void> {
  try {
    const session = await getSession();


  } catch (err) {
    console.error("inference fail:" + err)
  }
}
