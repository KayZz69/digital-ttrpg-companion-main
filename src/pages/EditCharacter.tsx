import { useNavigate, useParams } from "react-router-dom";
import { DnD5eCharacterForm } from "@/components/DnD5eCharacterForm";

/**
 * Dedicated page for editing existing D&D 5e characters.
 * Ensures edit routes always perform updates rather than create operations.
 */
export const EditCharacter = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    if (id) {
      navigate(`/character/${id}`);
      return;
    }
    navigate("/characters");
  };

  return (
    <div className="min-h-screen bg-background">
      <DnD5eCharacterForm onBack={handleBack} editMode />
    </div>
  );
};

