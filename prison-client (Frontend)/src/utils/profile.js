const key = (user) => `profilePhoto:${user?._id || user?.id || user?.username || "me"}`;

export const getPhoto = (user) => localStorage.getItem(key(user)) || "";

export const savePhoto = (user, dataUrl) => {
  if (dataUrl) localStorage.setItem(key(user), dataUrl);
  else localStorage.removeItem(key(user));
  window.dispatchEvent(new Event("profile-updated"));
};

// image eka 300px walata podi karanawa
export const resizeImage = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 300 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });