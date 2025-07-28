import { OwnedNamespaceCard } from "./OwnedNamespaceCard";

export function OwnedNamespaces() {
  return (
    <div>
        <div>
            <h4 className="text-md font-sm text-gray-900 dark:text-gray-300">Namespaces owned by you</h4>
        </div>
        <div className="mt-3">
            <OwnedNamespaceCard title="Strokes" />
            <OwnedNamespaceCard title="InstantCrush"/>
            <OwnedNamespaceCard title="StairwayToHeaven"/>
        </div>
    </div>
  );
}