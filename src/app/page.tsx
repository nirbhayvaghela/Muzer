import AuthButton from "@/components/authButton";

export default function Home() {
  return (
    <div className="m-16">
      <div className="flex justify-between">
        <h2>Muzi</h2>
        <div>
          <AuthButton />
        </div>
      </div>
    </div>
  );
}
