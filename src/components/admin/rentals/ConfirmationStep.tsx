import { useRouter } from "next/navigation";

interface ConfirmationStepProps {
  onNewRental: () => void;
}

export default function ConfirmationStep({ onNewRental }: ConfirmationStepProps) {
  const router = useRouter();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="mb-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900">Location enregistrée avec succès!</h3>
        <p className="mt-2 text-sm text-gray-500">
          La location a été correctement enregistrée dans le système.
        </p>
      </div>
      
      <div className="mt-6">
        <button
          type="button"
          className="mr-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          onClick={onNewRental}
        >
          Nouvelle location
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          onClick={() => router.push("/admin/dashboard")}
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
}
