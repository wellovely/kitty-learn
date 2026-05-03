import { ImageResponse } from "next/og"

export const alt = "Kitty Learn icon"

export const size = {
  width: 512,
  height: 512,
}

export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #d6efff 0%, #eaffd4 100%)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "#ffffff",
            border: "18px solid #0a85c4",
            borderRadius: 128,
            boxShadow: "0 26px 0 #0a85c4",
            color: "#0a85c4",
            display: "flex",
            fontSize: 220,
            height: 360,
            justifyContent: "center",
            lineHeight: 1,
            width: 360,
          }}
        >
          K
        </div>
      </div>
    ),
    size
  )
}
