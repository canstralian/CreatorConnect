import { createContext, useContext, useState } from "react";

interface PostContextProps {
  showCreatePostModal: boolean;
  setShowCreatePostModal: (show: boolean) => void;
}

export const PostContext = createContext<PostContextProps>({
  showCreatePostModal: false,
  setShowCreatePostModal: () => {},
});

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const [showCreatePostModal, setShowCreatePostModal] = useState<boolean>(false);

  return (
    <PostContext.Provider
      value={{
        showCreatePostModal,
        setShowCreatePostModal,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => useContext(PostContext);
