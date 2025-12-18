import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Users, Zap, Shield, ArrowRight, Building2, Globe, Award } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Gestion des talents",
    description: "Centralisez toutes les informations de vos collaborateurs en un seul endroit.",
  },
  {
    icon: Zap,
    title: "Performance optimale",
    description: "Des outils puissants pour maximiser la productivité de vos équipes.",
  },
  {
    icon: Shield,
    title: "Sécurité garantie",
    description: "Vos données sont protégées avec les plus hauts standards de sécurité.",
  },
];

export default function Index() {
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl =
          import.meta.env.VITE_API_URL || "http://localhost:3000";

        const response = await fetch(`${baseUrl}/api/employees`);
        if (!response.ok) {
          throw new Error(`Erreur API (${response.status})`);
        }

        const data: unknown[] = await response.json();
        setEmployeeCount(data.length);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques :", error);
        setEmployeeCount(null);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      value:
        employeeCount === null ? "..." : `${employeeCount}+`,
      label: "Employés",
      icon: Users,
    },
    { value: "12", label: "Pays", icon: Globe },
    { value: "98%", label: "Satisfaction", icon: Award },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Building2 className="w-4 h-4" />
              Plateforme RH Nouvelle Génération
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              Bienvenue chez{" "}
              <span className="gradient-text">DSPI-TECH</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Gérez efficacement vos ressources humaines avec notre plateforme intuitive et performante. 
              L'excellence technologique au service de vos équipes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button asChild variant="glow" size="xl">
                <Link to="/salaries">
                  Voir les salariés
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/nouveau">
                  Ajouter un employé
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="glass rounded-2xl p-8 text-center group hover:border-primary/50 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pourquoi choisir <span className="gradient-text">DSPI-TECH</span> ?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Des fonctionnalités puissantes pour transformer votre gestion des ressources humaines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass rounded-2xl p-8 group hover:border-primary/50 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:glow transition-all duration-300">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Prêt à commencer ?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Rejoignez DSPI-TECH et découvrez une nouvelle façon de gérer vos équipes.
              </p>
              <Button asChild variant="glow" size="xl">
                <Link to="/contact">
                  Nous contacter
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
