chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CREATE_JOB_POSTING") {
    createJobPosting(message.payload)
      .then(data => sendResponse({ success: true, data }))
      .catch(err =>
        sendResponse({ success: false, error: err.message })
      );

    return true;
  }
});

async function createJobPosting(payload: any) {
  //const { access_token } = await chrome.storage.local.get("access_token");

  const res = await fetch(
    "https://0.0.0.0:8000/company/job_posting/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        //Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify(payload)
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create job posting");
  }

  return res.json();
}
