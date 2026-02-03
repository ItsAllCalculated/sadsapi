import React, { useState, useEffect } from "react";
import Gallery from "./Gallery";
import Members from "./Members";
import "./fonts.css";

function App() {
  // SECTION 1 state
  const [isHovered, setIsHovered] = useState(false);
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [images, setImages] = useState([]);
  const [hover, setHover] = useState(false);

  // SECTION 2 state (new upload area)
  const [bannerFile, setBannerFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const [uploadDone, setUploadDone] = useState(false);
  const allowedFiles = ["banner1.jpg", "banner2.jpg", "banner3.jpg", "about.jpg"];
  const [bannerHover, setBannerHover] = useState(false);
  const [images2, setImages2] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [images3, setImages3] = useState([]);


  // TEAM section
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [photo, setPhoto] = useState(null);

  // Delete state (used in Section 2)
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  // styling modal
  const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  position: "relative",   // Needed for absolute close button
  background: "#404040",
  padding: "25px",
  width: "90%",
  maxWidth: "450px",
  color: "white",
  marginBottom:'50px',
};


const titleStyle = {
  marginTop: 0,
  marginBottom: "0px",
  fontSize: "1.3rem",
  fontWeight: "bold",
  textAlign: "center",
};

const closeIconWrapper = {
  position: "absolute",
  top: "0px",
  right: "12px",
  fontSize: "2rem",
  cursor: "pointer",
  color: "white",
  userSelect: "none",
};

const iconRow = {
  display: "flex",
  justifyContent: "center",
  gap: "30px",
};

const iconHoverStyle = {
  fontSize: "1.8rem",
  color: "white",
  textDecoration: "none",
  cursor: "pointer",
  marginTop: '15px',
};


  // Fetch images for Section 1 gallery
  const fetchImages = () => {
    fetch("https://sadsapi-616938642091.europe-west1.run.app/images")
      .then((res) => res.json())
      .then((data) => setImages(data.images))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchImages();
  }, []);


    const fetchTeam = () => {
    fetch("https://sadsapi-616938642091.europe-west1.run.app/team")
      .then((res) => res.json())
      .then((data) => setImages2(data.images))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchInactiveTeam();
  }, []);

      const fetchInactiveTeam = () => {
    fetch("https://sadsapi-616938642091.europe-west1.run.app/inactiveteam")
      .then((res) => res.json())
      .then((data) => setImages3(data.images))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchInactiveTeam();
  }, []);

const handleUpload = async (e) => {
  e.preventDefault();

  // Check all fields before allowing upload
  if (!subtitle.trim() || !link.trim() || !file) {
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("link", link);
  formData.append("subtitle", subtitle);

  try {
    const res = await fetch("https://sadsapi-616938642091.europe-west1.run.app/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload file");

    // Reset fields
    setFile(null);
    setLink("");
    setSubtitle("");

    // Refresh gallery
    fetchImages();
  } catch (err) {
    console.error("Error uploading file:", err);
  }
};

const handleTeamUpload = async (e) => {
  e.preventDefault();

  // Check all fields before allowing upload
  if (!name.trim() || !bio.trim() || !photo  || !role.trim()) {
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("role", role);
  formData.append("bio", bio);
  formData.append("file", photo);
  formData.append("linkedin", linkedin);
  formData.append("github", github);
  formData.append("website", website);

  try {
    const res = await fetch("https://sadsapi-616938642091.europe-west1.run.app/uploadteam", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload file");

    // Reset fields
    setPhoto(null);
    setName("");
    setRole("");
    setBio("");
    setLinkedin("");
    setGithub("");
    setWebsite("");

    // Refresh team
    fetchTeam();
  } catch (err) {
    console.error("Error uploading file:", err);
  }
};

  // Handle banner uploads (Section 2)
const handleBannerUpload = async (e) => {
  e.preventDefault();
  if (!bannerFile) {
    setBannerMessage("Please select a file to upload.");
    return;
  }

  // Show preview immediately
  const previewUrl = URL.createObjectURL(bannerFile);
  setImageUrl(previewUrl);
  setBannerMessage("Uploading...");

  const formData = new FormData();
  formData.append("file", bannerFile);

  try {
    const res = await fetch("https://sadsapi-616938642091.europe-west1.run.app/upload_banner", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      // ✅ Ensure correct backend image URL is used if available
      if (data && data.imageUrl) {
        setImageUrl(data.imageUrl);
      }
      setBannerMessage("Upload successful!");
      setUploadDone(true);
    } else {
      setBannerMessage("Upload failed.");
      setUploadDone(false);
    }
  } catch (err) {
    console.error(err);
    setBannerMessage("Error uploading file.");
    setUploadDone(false);
  } finally {
    setBannerFile(null);
  }
};

  // Handle deletions (Section 2)
 const handleBannerDelete = async (e) => {
  e.preventDefault();
  if (!deleteInput.trim()) return;

  try {
    const res = await fetch(
      `https://sadsapi-616938642091.europe-west1.run.app/delete_banner/${encodeURIComponent(deleteInput)}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setDeleteMessage("File deleted successfully.");
    } else {
      setDeleteMessage("Could not find or delete file.");
    }
  } catch (err) {
    console.error(err);
    setDeleteMessage("Error deleting file.");
  }

  setDeleteInput("");
};
const handleResourceDelete = async (id) => {
  if (!id) return;

  try {
    const res = await fetch(
      `https://sadsapi-616938642091.europe-west1.run.app/images/${id}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      // Remove the deleted image from state
      setImages((prev) => prev.filter((img) => img.id !== id));
      console.log("Deleted successfully");
    } else {
      console.error("Could not delete resource.");
    }
  } catch (err) {
    console.error("Error deleting resource:", err);
  }
};

const handleActivityChange = async (id) => {
  if (!id) return;

  try {
    const res = await fetch(`https://sadsapi-616938642091.europe-west1.run.app/updateActivity`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ memberId: id }),
});


    if (res.ok) {
      console.log("Updated successfully");
      fetchTeam();
    } else {
     console.log("else")
    }
  } catch (err) {
    console.log("error")
  }
};


const handleMemberDelete = async (id) => {
  if (!id) return;

  try {
    const res = await fetch(
      `https://sadsapi-616938642091.europe-west1.run.app/team/${id}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      // Remove the deleted image from state
      fetchTeam();
      console.log("Deleted successfully");
    } else {
      console.error("Could not delete resource.");
    }
  } catch (err) {
    console.error("Error deleting resource:", err);
  }
};



    const [currentTab, setCurrentTab] = useState("resources");

  return (
    <div
         style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        color: "white",
        textAlign: "center",
        paddingTop: "0px",
      }}
    >
      
      {/* Logo */}
      <a href="https://sads.club" target="_blank" rel="noopener noreferrer">
        <img
          src="https://sads.club/static/media/sads_logo.88d07e896311a6f9aa80.png"
          alt="SADS Logo"
          style={{ height: "125px", margin: "15px auto", display: "block" }}
        />
      </a>

      {/* TAB NAVIGATION */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          backgroundColor: "#353535",
          padding: "6px 10px",
        }}
      >
        {["resources", "team", "images", "calendar"].map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            style={{
              backgroundColor: currentTab === tab ? "#606060" : "transparent",
              color: "white",
              border: "none",
              cursor: "pointer",
              padding: "8px 16px",
              fontFamily: "RionaSansBlack",
              fontSize: "1rem",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                currentTab === tab ? "#555555" : "#454545")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                currentTab === tab ? "#555555" : "transparent")
            }
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* RESOURCES TAB */}
      {currentTab === "resources" && (
        <>

          {/* Upload Form */}
            <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        color: "white",
        textAlign: "center",
        paddingTop: "0px",
      }}
    >
                  <div
            style={{
              backgroundColor: "#404040",
              padding: "15px",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <textarea
              placeholder="Write title here..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              style={{
                width: "90%",
                padding: "8px",
                marginBottom: "10px",
                border: "none",
                outline: "none",
                backgroundColor: "#555",
                color: "white",
                textAlign: "left",
                resize: "none",
                fontSize: ".9rem",
                height: "36px",
              }}
            />
            <textarea
              placeholder="Enter link here..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              style={{
                width: "90%",
                padding: "8px",
                marginBottom: "5px",
                border: "none",
                outline: "none",
                backgroundColor: "#555",
                color: "white",
                textAlign: "left",
                resize: "none",
                fontSize: ".9rem",
                height: "36px",
              }}
            />

<input
  id="fileInput"
  type="file"
  accept="image/*"
  onChange={(e) => setFile(e.target.files[0])}
  style={{ display: "none" }}
/>

<label
  htmlFor="fileInput"
  onMouseEnter={() => setHover(true)}
  onMouseLeave={() => setHover(false)}
  style={{
    cursor: "pointer",
    backgroundColor: "#404040",
    color: hover ? "#d1d1d1ff" : "white",
    padding: "0px 15px",
    display: "inline-flex",
    gap: "8px",
    fontFamily: "RionaSansMedium",
    marginBottom: "15px",
    marginTop: "10px",
  }}
>
  <i
    className="fa-solid fa-arrow-up-from-bracket"
    style={{ ccolor: hover ? "#d1d1d1ff" : "white" }} 
  ></i>
  
  {file ? file.name : "Select an image"}
</label>

<br />

{file && (
  <>
    <img
      src={URL.createObjectURL(file)}
      alt="preview"
      className="mt-5 mb-5 max-h-48 rounded-lg"
      width="200px"
    />
    <div style={{ height: "10px" }} />
  </>
)}



      
            <button
              onClick={handleUpload}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                backgroundColor: isHovered ? "#535353" : "#606060",
                color: "white",
                padding: "8px 16px",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              <h2 style={{ fontSize: "1rem", margin: "0", fontWeight: "bold" }}>
                Add Resource
              </h2>
            </button>
          </div>

          {/* Gallery */}
          <div
            style={{
              marginBottom: "30px",
              marginTop: "10px",
              width: "100%",
              maxWidth: "90vw",
            }}
          >
            <Gallery
              images={images}
              showDelete={true}
              onDelete={handleResourceDelete}
              disableLinks={true}
            />
          </div>
          </div>
        </>
      )}

      {currentTab === "team" && (
            <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        color: "white",
        textAlign: "center",
        paddingTop: "0px",
      }}
    >
                  <div
            style={{
              backgroundColor: "#404040",
              padding: "15px",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <textarea
              placeholder="Write name here..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "90%",
                padding: "8px",
                marginBottom: "10px",
                border: "none",
                outline: "none",
                backgroundColor: "#555",
                color: "white",
                textAlign: "left",
                resize: "none",
                fontSize: ".9rem",
                height: "20px",
              }}
            />
            <textarea
              placeholder="Write club role here..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "90%",
                padding: "8px",
                marginBottom: "10px",
                border: "none",
                outline: "none",
                backgroundColor: "#555",
                color: "white",
                textAlign: "left",
                resize: "none",
                fontSize: ".9rem",
                height: "20px",
              }}
            />
            <textarea
              placeholder="Write bio here..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{
                width: "90%",
                padding: "8px",
                marginBottom: "10px",
                border: "none",
                outline: "none",
                backgroundColor: "#555",
                color: "white",
                textAlign: "left",
                resize: "none",
                fontSize: ".9rem",
                height: "60px",
              }}
            />
           <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
  <i
    className="fa-brands fa-linkedin"
    style={{ marginLeft: '12px', fontSize: "1.5rem", width: '30px' }}
  ></i>

  <textarea
    placeholder="LinkedIn URL (optional)..."
    value={linkedin}
    onChange={(e) => setLinkedin(e.target.value)}
    style={{
      width: "80%",
      padding: "8px",
      border: "none",
      outline: "none",
      backgroundColor: "#555",
      color: "white",
      resize: "none",
      fontSize: ".9rem",
      height: "20px",
    }}
  />
</div>
<div style={{ width: '100%', display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
  <i
    className="fa-brands fa-github"
    style={{ marginLeft: '12px', fontSize: "1.5rem", width: '30px' }}
  ></i>

  <textarea
    placeholder="GitHub URL (optional)..."
    value={github}
    onChange={(e) => setGithub(e.target.value)}
    style={{
      width: "80%",
      padding: "8px",
      border: "none",
      outline: "none",
      backgroundColor: "#555",
      color: "white",
      resize: "none",
      fontSize: ".9rem",
      height: "20px",
    }}
  />
</div>

<div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
  <i
    className="fa-solid fa-user"
    style={{ marginLeft: '12px', fontSize: "1.5rem", width: '30px' }}
  ></i>

  <textarea
    placeholder="Personal website URL (optional)..."
    value={website}
    onChange={(e) => setWebsite(e.target.value)}
    style={{
      width: "80%",
      padding: "8px",
      border: "none",
      outline: "none",
      backgroundColor: "#555",
      color: "white",
      resize: "none",
      fontSize: ".9rem",
      height: "20px",
    }}
  />
</div>


<input
  id="fileInput"
  type="file"
  accept="image/*"
  onChange={(e) => setPhoto(e.target.files[0])}
  style={{ display: "none" }}
/>

<label
  htmlFor="fileInput"
  onMouseEnter={() => setHover(true)}
  onMouseLeave={() => setHover(false)}
  style={{
    cursor: "pointer",
    backgroundColor: "#404040",
    color: hover ? "#d1d1d1ff" : "white",
    padding: "0px 15px",
    display: "inline-flex",
    gap: "8px",
    fontFamily: "RionaSansMedium",
    marginBottom: "15px",
    marginTop: "10px",
  }}
>
  <i
    className="fa-solid fa-arrow-up-from-bracket"
    style={{ ccolor: hover ? "#d1d1d1ff" : "white" }} 
  ></i>
  
  {photo ? photo.name : "Select an image"}
</label>

<br />

{photo && (
  <>
    <img
      src={URL.createObjectURL(photo)}
      alt="preview"
      className="mt-5 mb-5 max-h-48 rounded-lg"
      width="200px"
    />
    <div style={{ height: "10px" }} />
  </>
)}



      
            <button
              onClick={handleTeamUpload}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                backgroundColor: isHovered ? "#535353" : "#606060",
                color: "white",
                padding: "8px 16px",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              <h2 style={{ fontSize: "1rem", margin: "0", fontWeight: "bold" }}>
                Add Member
              </h2>
            </button>
          </div>
          <div
            style={{
              marginBottom: "30px",
              marginTop: "10px",
              width: "100%",
              maxWidth: "90vw",
            }}
          >
            <Members
              images={images2}
              showDelete={true}
              onDelete={handleMemberDelete}
              onActive={handleActivityChange}
              disableLinks={true}
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              setModalData={setModalData}
            />
             <Members
              images={images3}
              showDelete={true}
              onDelete={handleMemberDelete}
              onActive={handleActivityChange}
              disableLinks={true}
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              setModalData={setModalData}
            />
{modalOpen && modalData && (
  <div style={overlayStyle} onClick={() => setModalOpen(false)}>
    <div
      style={modalStyle}
      onClick={(e) => e.stopPropagation()} // prevent background click closing modal
    >
      <div style={closeIconWrapper} onClick={() => setModalOpen(false)}>×</div>

      <h2 style={titleStyle}>{modalData.name} • {modalData.role}</h2>
      <p style={{ marginBottom: '5px', marginTop: "15px", whiteSpace: "pre-line" }}>
  {modalData.bio}
</p>
<div style={iconRow}>
  {modalData.linkedin && (
    <a
  href={modalData.linkedin}
  target="_blank"
  rel="noopener noreferrer"
  style={iconHoverStyle}
  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
  onMouseLeave={(e) => (e.target.style.opacity = "1")}
>
  <i className="fa-brands fa-linkedin"></i>
</a>

  )}

  {modalData.github && (
 <a
  href={modalData.github}
  target="_blank"
  rel="noopener noreferrer"
  style={iconHoverStyle}
  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
  onMouseLeave={(e) => (e.target.style.opacity = "1")}
>
  <i className="fa-brands fa-github"></i>
</a>
  )}

  {modalData.website && (
  
<a
  href={modalData.website}
  target="_blank"
  rel="noopener noreferrer"
  style={iconHoverStyle}
  onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
  onMouseLeave={(e) => (e.target.style.opacity = "1")}
>
  <i className="fa-solid fa-user"></i>
</a>
  )}
</div>

<img
                src={`https://storage.googleapis.com/messagesapi/${modalData.filename}`}
                alt={modalData.originalName}
                style={{
                  width: "300px",
                  objectFit: "cover",
                  marginTop: '15px',
                }}
              />
    </div>
  </div>
)}



          </div>

          </div>
 
          
      )}

      {/* IMAGES TAB */}
      {currentTab === "images" && (
        <>
          {/* Upload Section */}
          <div
            style={{
              backgroundColor: "#404040",
              padding: "15px",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <input
  id="bannerFileInput"
  type="file"
  accept="image/jpeg,.jpg"
  onChange={(e) => setBannerFile(e.target.files[0])}
  style={{ display: "none" }}   // hide real input
/>

<label
  htmlFor="bannerFileInput"
  onMouseEnter={() => setBannerHover(true)}
  onMouseLeave={() => setBannerHover(false)}
  style={{
    cursor: "pointer",
    backgroundColor: "#404040",
    color: bannerHover ? "#d1d1d1ff" : "white",
    padding: "0px 15px",
    display: "inline-flex",
    gap: "8px",
    fontFamily: "RionaSansMedium",
    marginBottom: "15px",
  }}
>
  <i
    className="fa-solid fa-arrow-up-from-bracket"
    style={{ color: bannerHover ? "#d1d1d1ff" : "white" }}
  ></i>

  {bannerFile ? bannerFile.name : "Select an image"}
</label>

<br />

{bannerFile && (
  <>
    <img
      src={URL.createObjectURL(bannerFile)}
      alt="preview"
      className="mt-5 mb-5 max-h-48 rounded-lg"
      width="200px"
    />
    <div style={{ height: "10px" }} />
  </>
)}
            <button
              onClick={handleBannerUpload}
              style={{
                backgroundColor: "#606060",
                color: "white",
                padding: "8px 16px",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#535353")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#606060")
              }
            >
              <h2
                style={{
                  fontSize: "1rem",
                  margin: "0",
                  fontWeight: "bold",
                }}
              >
                Upload
              </h2>
            </button>
          </div>
         {imageUrl && (
            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <p style={{ marginTop: "5px", marginBottom: "0px" }}>
                Uploaded successful.
              </p>
            </div>
          )}
          {!uploadDone && (
            <div
              style={{
                marginTop: "0px",
                textAlign: "center",
                color: "#aaa",
                fontSize: "0.9rem",
                maxWidth: "400px",
              }}
            >
              <br/>
              <b>
              <p  style={{
                  fontFamily: "RionaSansMedium",
                  whiteSpace: "pre-line",
                  margin: 0,
                }}>Allowed file names:</p></b>
                <br/>
              <p
                style={{
                  fontFamily: "RionaSansMedium",
                  whiteSpace: "pre-line",
                  margin: 0,
                }}
              >
                {allowedFiles.join("\n")}
              </p>
            </div>
          )}

 

          {/* Delete Section */}
          <div
            style={{
              backgroundColor: "#404040",
              padding: "15px",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
              marginTop: "20px",
              marginBottom: "30px",
            }}
          >
            <form onSubmit={handleBannerDelete}>
              <textarea
                placeholder="Type file name to delete (e.g. banner1.jpg)"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                style={{
                  width: "90%",
                  padding: "8px",
                  marginBottom: "10px",
                  border: "none",
                  outline: "none",
                  backgroundColor: "#555",
                  color: "white",
                  textAlign: "left",
                  resize: "none",
                  fontSize: ".9rem",
                  height: "18px",
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: "#c0392b",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                }} onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#9e2e24ff")
                }  onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#c0392b")
                }
              >
                <h2
                  style={{
                    fontSize: "1rem",
                    margin: "0",
                    fontWeight: "bold",
                  }}
                >
                  Delete
                </h2>
              </button>
            </form>
            {deleteMessage && (
              <p
                style={{
                  fontFamily: "RionaSansMedium",
                  marginTop: "10px",
                  marginBottom: "0px",
                }}
              >
                {deleteMessage}
              </p>
            )}
            
          </div>
          
        </>
        
      )}

      {/* CALENDAR TAB */}
      {currentTab === "calendar" && (
        <>
          <p style={{ fontFamily: "RionaSansMedium", marginTop: "0px", maxWidth: "400px" }}>
            The calendar on the website is linked to the Google Calendar named "SADS" on the SADS' email.<br /><br />
            Make sure to include room number and start time when adding a new event.
          </p>
        </>
      )}
    </div>
  );
}

export default App;
