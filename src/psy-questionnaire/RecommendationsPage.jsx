import CocktailListPage from '../CocktailsListPage.jsx';
import Button from "@mui/material/Button";
import WestIcon from "@mui/icons-material/West";

function RecommendationsPage({ recommendations, onBack }) {
    return (
        <div>
            <div className="btn" style={{ marginTop: "25px" }}>
                <Button
                    className="back-btn"
                    variant="text"
                    onClick={onBack}
                    data-testid="back-button"
                    style={{ cursor: 'pointer' }}
                >
                    <WestIcon className="learn-arrow" sx={{ fontSize: "30px" }} />
                </Button>
            </div>

            <CocktailListPage
                cocktails={recommendations}
                title="Для вас"
                showHelper={false}
            />
        </div>
    );
}
export default RecommendationsPage;