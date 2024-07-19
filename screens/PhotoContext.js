// PhotoContext.js
import React, { createContext, useState, useContext } from 'react';

const PhotoContext = createContext();

export const usePhotos = () => useContext(PhotoContext);

export const PhotoProvider = ({ children }) => {
  const [photos, setPhotos] = useState([]);

  const updatePhotos = (newPhotos) => {
    setPhotos(newPhotos);
  };

  return (
    <PhotoContext.Provider value={{ photos, updatePhotos }}>
      {children}
    </PhotoContext.Provider>
  );
};
