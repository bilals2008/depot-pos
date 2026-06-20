// File: ogs-client/depot/src/components/dashboard/ActionCard.jsx
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ActionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  variant = "default",
  size = "default",
  className 
}) => {
  const variants = {
    default: "bg-white dark:bg-zinc-900 border-blue-100/50 dark:border-zinc-800 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-zinc-700 shadow-sm",
    primary: "bg-blue-600 text-white hover:bg-blue-700 border-blue-500",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-500",
    warning: "bg-amber-500 text-white hover:bg-amber-600 border-amber-400",
    destructive: "bg-rose-600 text-white hover:bg-rose-700 border-rose-500",
    purple: "bg-purple-600 text-white hover:bg-purple-700 border-purple-500",
    orange: "bg-orange-500 text-white hover:bg-orange-600 border-orange-400",
    cyan: "bg-cyan-600 text-white hover:bg-cyan-700 border-cyan-500",
  };

  const iconColors = {
    default: "bg-blue-50 text-blue-600 dark:bg-zinc-800/50 dark:text-blue-400",
    primary: "bg-white/20 text-white",
    success: "bg-white/20 text-white",
    warning: "bg-white/20 text-white",
    destructive: "bg-white/20 text-white",
    purple: "bg-white/20 text-white",
    orange: "bg-white/20 text-white",
    cyan: "bg-white/20 text-white",
  };

  const isLarge = size === "large";

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 border-2",
        "active:scale-95 select-none overflow-hidden group",
        isLarge ? "min-h-40" : "min-h-30",
        variants[variant],
        className
      )}
      onClick={onClick}
    >
      <CardContent className={cn(
        "flex flex-col items-center justify-center h-full p-4 gap-3",
        isLarge && "p-6 gap-4"
      )}>
        <div className={cn(
          "p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm",
          iconColors[variant]
        )}>
          {Icon && <Icon className={cn(
            isLarge ? "h-10 w-10" : "h-8 w-8"
          )} strokeWidth={1.5} />}
        </div>
        <div className="text-center">
          <h3 className={cn(
            "font-extrabold leading-tight",
            isLarge ? "text-xl" : "text-lg"
          )}>{title}</h3>
          {description && (
            <p className={cn(
              "mt-3 opacity-80 font-medium",
              isLarge ? "text-sm" : "text-xs"
            )}>{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionCard;
