import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../authContext/useAuth.js";
import {
  Box,
  Stack,
  Typography,
  Button,
  Link as MUILink,
} from "@mui/material";
import './admin.css'

function AdminPage() {
  const { role, roles, logout } = useAuth();
  const isSuper = role === "super_admin" || (roles || []).includes("super_admin");
  return (
    <Box className="form-container">
        <Typography component="h1" className="form-title">
          Административная панель
        </Typography>

        <Stack
          component="nav"
          direction="row"
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
          sx={{ mb: 2 }}
        >
          {isSuper && (
            <>
              <MUILink component={RouterLink} to="/super/bars/new" underline="hover" className = "mode-button">
                <span>Создать бар</span>
              </MUILink>
              <MUILink component={RouterLink} to="/super/assign" underline="hover" className = "mode-button">
                <span>Создать сотрудника</span>
              </MUILink>
              <MUILink component={RouterLink} to="/super/grant" underline="hover" className = "mode-button">
                <span>Назначить бар‑админа</span>
              </MUILink>
            </>
          )}
        </Stack>

        <Button
          variant="contained"
          color="primary"
          onClick={logout}
          sx={{ mt: 1 }}
          className="form-button"
        >
          Выйти
        </Button>
    </Box>
  );
}

export default AdminPage;