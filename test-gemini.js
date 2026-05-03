const key = "AIzaSyC7vXUD-vMCo3xKBDnUqvnh8Q2nyB9ioMA";

async function run() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await response.json();
  if (data.models) {
    console.log("Available models:");
    data.models.forEach(m => console.log(m.name));
  } else {
    console.log("Error:", data);
  }
}
run();
