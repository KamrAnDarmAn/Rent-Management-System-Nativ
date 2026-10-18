import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import { StyleSheet } from "react-native";

/** Decorative scenery stays behind the supplied transparent shop artwork. */
export function SplashBackdrop() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 754"
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFill}
      accessible={false}
    >
      <Defs>
        <RadialGradient id="splashCloud">
          <Stop offset="0.55" stopColor="#ffffff" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="splashSky" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#ffffff" />
          <Stop offset="0.5" stopColor="#f1fbfe" />
          <Stop offset="1" stopColor="#ffffff" />
        </LinearGradient>
        <LinearGradient id="splashBuildings" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#c4e3ef" />
          <Stop offset="1" stopColor="#ecf8fc" />
        </LinearGradient>
        <LinearGradient id="splashGround" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#d8f0f4" stopOpacity="0.8" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect width="390" height="754" fill="url(#splashSky)" />
      <Circle cx="37" cy="375" r="23" fill="url(#splashCloud)" />
      <Circle cx="11" cy="382" r="16" fill="url(#splashCloud)" />
      <Circle cx="65" cy="385" r="17" fill="url(#splashCloud)" />
      <Circle cx="357" cy="375" r="22" fill="url(#splashCloud)" />
      <Circle cx="330" cy="384" r="15" fill="url(#splashCloud)" />
      <Path
        d="M0 435 L15 432 L27 436 V534 H0Z M39 401 L58 396 L73 401 V535 H39Z M92 446 L105 442 L119 448 V535 H92Z M257 360 L281 354 L296 362 V535 H257Z M292 419 L306 414 L320 420 V535 H292Z M313 400 L336 394 L351 401 V535 H313Z M374 438 L383 434 L390 439 V535 H374Z"
        fill="url(#splashBuildings)"
      />
      <Path
        d="M58 396 L73 401 V535 H58Z M281 354 L296 362 V535 H281Z M336 394 L351 401 V535 H336Z"
        fill="#c6e3ee"
        opacity="0.7"
      />
      <Path
        d="M0 524 Q8 509 16 524 Q25 507 37 522 Q49 511 58 528 Q68 509 81 527 Q93 515 107 530 H281 Q295 514 308 527 Q321 511 334 525 Q346 506 357 524 Q371 508 383 525 Q389 512 395 521 V540 H0Z"
        fill="#c5e9ee"
        opacity="0.8"
      />
      <Rect y="539" width="390" height="1" fill="#cae5ed" />
      <Rect y="540" width="390" height="73" fill="url(#splashGround)" />
    </Svg>
  );
}
