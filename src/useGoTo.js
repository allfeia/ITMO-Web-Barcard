import { useNavigate } from "react-router-dom";

export function useGoTo() {
    const navigate = useNavigate();

    return (path) => {
        navigate(path);
    };
}
