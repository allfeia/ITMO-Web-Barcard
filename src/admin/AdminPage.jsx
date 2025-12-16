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
    <Box className="mode-container">
        <Typography component="h1" className="mode-title">
          Административная панель
        </Typography>

        <Stack
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
          sx={{ mb: 2 }}
          className="mode-buttons"
        >
          {isSuper && (
            <>
              <MUILink component={RouterLink} to="/super/bars/new"  underline="none" className = "mode-button">
                Добавить бар
              </MUILink>
              <MUILink component={RouterLink} to="/super/assign"  underline="none" className = "mode-button">
                Добавить сотрудника
              </MUILink>
              <MUILink component={RouterLink} to="/super/grant" underline="none" className = "mode-button">
                Выдать/снять администраторские права для сотрудника бара
              </MUILink>
            </>
          )}
        </Stack>

        <Button
          onClick={logout}
          className="form-button"
        >
          Выйти
        </Button>
    </Box>
  );
}

export default AdminPage;