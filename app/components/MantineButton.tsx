"use client";

import { useEffect } from "react";
import { notifications } from "@mantine/notifications";

interface DemoProps {
  title: string;
  message: string;
  color: string;
}

const Notify: React.FC<DemoProps> = ({ title, message, color }) => {
  useEffect(() => {
    if (title && message) {
      notifications.show({
        title,
        message,
        color,
        radius: "md",
      });
    }
  }, [title, message, color]);

  return null;
};

export default Notify;
