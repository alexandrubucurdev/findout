import { FileText, AlertCircle } from "lucide-react";

const techniques = [
  {
    name: "Whataboutism",
    description: "Devierea atenției prin comparații irelevante",
    severity: "high",
  },
  {
    name: "Apel la frică",
    description: "Manipulare prin stimularea anxietății",
    severity: "critical",
  },
  {
    name: "Simplificare excesivă",
    description: "Reducerea problemelor complexe la soluții simple",
    severity: "medium",
  },
  {
    name: "Ad hominem",
    description: "Atacuri personale în loc de argumente",
    severity: "high",
  },
  {
    name: "Apel la autoritate",
    description: "Invocarea autorității fără dovezi",
    severity: "medium",
  },
];

export default function SitrepPanel() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-950 border-red-700 text-red-400";
      case "high":
        return "bg-orange-950 border-orange-700 text-orange-400";
      case "medium":
        return "bg-yellow-950 border-yellow-700 text-yellow-400";
      default:
        return "bg-slate-950 border-slate-700 text-slate-400";
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-700 px-5 py-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h3 className="font-mono tracking-wider text-lg">PATTERN DETECTION</h3>
        </div>
        <p className="text-xs text-slate-500 font-mono mt-1">SITUATION REPORT</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="flex items-start gap-2 pb-4 border-b border-slate-800">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-mono text-sm text-slate-300 mb-1">
              COGNITIVE MANIPULATION PATTERNS:
            </h4>
            <p className="text-xs text-slate-500">
              {techniques.length} identified patterns
            </p>
          </div>
        </div>

        {/* Technique Tags */}
        <div className="space-y-3">
          {techniques.map((technique, index) => (
            <div
              key={index}
              className="bg-slate-950 border border-slate-800 rounded-lg p-4 hover:border-red-900/50 transition-colors"
            >
              <div className="flex items-start gap-3 mb-2">
                <div
                  className={`px-2 py-1 border rounded text-xs font-mono ${getSeverityColor(
                    technique.severity
                  )}`}
                >
                  {technique.name}
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {technique.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
