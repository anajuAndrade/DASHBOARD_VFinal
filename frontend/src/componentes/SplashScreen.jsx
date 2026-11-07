
import { useEffect, useState } from "react";
import "./SplashScreen.css";

function SplashScreen({ onFinish }) {
    const [saindo, setSaindo] = useState(false);

    useEffect(() => {
        const iniciarSaida = setTimeout(() => {
            setSaindo(true);
        }, 2200);

        const finalizar = setTimeout(() => {
            onFinish();
        }, 2800);

        return () => {
            clearTimeout(iniciarSaida);
            clearTimeout(finalizar);
        };
    }, [onFinish]);

    return (
        <div className={`splash-screen ${saindo ? "splash-saindo" : ""}`}>
            <div className="splash-content">

                <div className="splash-text">
                    <h1>
                        Dashboard Interativo
                        <br />
                        para Visualização de
                        <br />
                        Ativos Digitais
                    </h1>

                    <p>NA WEB 3.0</p>
                </div>

                <div className="splash-logo-wrapper">
                    <img
                        src="/dashboard-icon.png"
                        alt="Logo do Dashboard"
                        className="splash-logo"
                    />
                </div>

            </div>
        </div>
    );
}

export default SplashScreen;
